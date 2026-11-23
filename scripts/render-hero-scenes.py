"""Render the seven FORMA / LAB hero scenes with Blender 4.3+.

Usage: blender -b --python scripts/render-hero-scenes.py -- --scene 1 --mode poster --output /tmp/hero.png
       blender -b --python scripts/render-hero-scenes.py -- --scene 1 --mode frames --output /tmp/hero-frames
"""
import argparse
import math
import os
import sys

import bpy
from mathutils import Vector


def arguments():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--scene", type=int, required=True, choices=range(1, 8))
    parser.add_argument("--mode", choices=("poster", "frames", "all"), required=True)
    parser.add_argument("--output", required=True)
    return parser.parse_args(argv)


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.materials, bpy.data.curves, bpy.data.meshes, bpy.data.cameras, bpy.data.lights):
        for block in list(datablocks):
            if block.users == 0:
                datablocks.remove(block)


def material(name, color, metallic=0.0, roughness=0.35, transmission=0.0, coat=0.0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*color, 1)
    shader.inputs["Metallic"].default_value = metallic
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["Transmission Weight"].default_value = transmission
    shader.inputs["Coat Weight"].default_value = coat
    return mat


def assign(obj, mat):
    if mat:
        obj.data.materials.append(mat)
    return obj


def bevel(obj, width=0.06, segments=3):
    mod = obj.modifiers.new("Machined edge highlights", "BEVEL")
    mod.width = width
    mod.segments = segments
    mod2 = obj.modifiers.new("Weighted studio normals", "WEIGHTED_NORMAL")
    mod2.keep_sharp = True
    return obj


def cube(name, loc, scale, mat, edge=0.05):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign(obj, mat)
    if edge:
        bevel(obj, min(edge, min(scale) * 0.46))
    return obj


def cylinder(name, loc, radius, depth, mat, vertices=96, edge=0.035, rotation=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc, rotation=rotation or (0, 0, 0))
    obj = bpy.context.object
    obj.name = name
    assign(obj, mat)
    if edge:
        bevel(obj, min(edge, depth * 0.22, radius * 0.22))
    for face in obj.data.polygons:
        if len(face.vertices) <= 4:
            face.use_smooth = True
    return obj


def sphere(name, loc, scale, mat, segments=64, rings=32):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign(obj, mat)
    for face in obj.data.polygons:
        face.use_smooth = True
    return obj


def torus(name, loc, major, minor, mat, rotation=None):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=96, minor_segments=16, location=loc, rotation=rotation or (0, 0, 0))
    obj = bpy.context.object
    obj.name = name
    assign(obj, mat)
    for face in obj.data.polygons:
        face.use_smooth = True
    return obj


def curve(name, points, radius, mat, cyclic=False):
    data = bpy.data.curves.new(name, "CURVE")
    data.dimensions = "3D"
    data.resolution_u = 24
    data.bevel_depth = radius
    data.bevel_resolution = 4
    spline = data.splines.new("BEZIER")
    spline.bezier_points.add(len(points) - 1)
    for point, co in zip(spline.bezier_points, points):
        point.co = co
        point.handle_left_type = "AUTO"
        point.handle_right_type = "AUTO"
    spline.use_cyclic_u = cyclic
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    assign(obj, mat)
    return obj


def text_object(name, body, loc, size, mat, rotation=(math.pi / 2, 0, 0), align="CENTER"):
    data = bpy.data.curves.new(name, "FONT")
    data.body = body
    data.size = size
    data.align_x = align
    data.extrude = 0.001
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = loc
    obj.rotation_euler = rotation
    assign(obj, mat)
    return obj


def lathe(name, profile, mat, segments=96):
    verts, faces = [], []
    for radius, z in profile:
        for i in range(segments):
            angle = 2 * math.pi * i / segments
            verts.append((radius * math.cos(angle), radius * math.sin(angle), z))
    for row in range(len(profile) - 1):
        for i in range(segments):
            a = row * segments + i
            b = row * segments + (i + 1) % segments
            c = (row + 1) * segments + (i + 1) % segments
            d = (row + 1) * segments + i
            faces.append((a, b, c, d))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.materials.append(mat)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    for face in mesh.polygons:
        face.use_smooth = True
    bevel(obj, 0.018, 2)
    return obj


def scene_one(m):
    dark = material("Graphite ceramic", (0.055, 0.075, 0.066), 0.18, 0.28, coat=0.24)
    silver = material("Brushed warm aluminum", (0.52, 0.57, 0.52), 0.86, 0.22)
    glass = material("Smoked green glass", (0.11, 0.23, 0.19), 0.22, 0.11, 0.38, 0.3)
    cube("Foundations / softened cube", (-0.65, 0, 0.83), (1.25, 1.25, 1.25), dark, 0.085)
    sphere("Foundations / polished sphere", (0.95, -0.03, 1.02), (0.73, 0.73, 0.73), silver)
    cylinder("Foundations / glass vessel", (2.2, 0.03, 0.83), 0.49, 1.68, glass, edge=0.035)
    torus("Vessel rim", (2.2, 0.03, 1.68), 0.465, 0.028, silver)
    cube("Floating studio plinth", (0.8, 0.5, 0.08), (4.3, 1.6, 0.16), material("Plinth", (0.09, 0.12, 0.105), 0.28, 0.3), 0.07)


def scene_two(m):
    ceramic = material("Satin forest ceramic", (0.105, 0.18, 0.145), 0.22, 0.24, coat=0.35)
    metal = material("Champagne anodized aluminum", (0.62, 0.47, 0.29), 0.82, 0.22)
    inner = material("Warm reflector", (0.82, 0.67, 0.43), 0.68, 0.26)
    cylinder("Lamp weighted foot", (0.8, 0, 0.16), 0.82, 0.28, ceramic, edge=0.09)
    cylinder("Foot trim", (0.8, 0, 0.31), 0.64, 0.045, metal, edge=0.015)
    curve("Swept lamp arm", [(0.8, 0, 0.39), (0.82, 0, 1.7), (1.15, 0, 2.55), (1.78, 0, 2.8)], 0.095, metal)
    sphere("Pivot housing", (0.82, 0, 1.62), (0.19, 0.19, 0.19), ceramic)
    sphere("Pivot cap", (0.82, -0.2, 1.62), (0.1, 0.035, 0.1), metal)
    # Shallow spun shade, open downward; concentric sections preserve a readable silhouette.
    shade=lathe("Spun reflector shade", [(0.16, 2.58), (0.25, 2.73), (0.66, 2.61), (0.78, 2.35), (0.72, 2.31)], ceramic)
    shade.location.x=1.78
    bowl=lathe("Reflector inner bowl", [(0.2, 2.52), (0.38, 2.61), (0.68, 2.43), (0.70, 2.35)], inner)
    bowl.location.x=1.78
    torus("Shade rolled edge", (1.78, 0, 2.35), 0.745, 0.035, metal)
    sphere("Diffuser", (1.78, 0, 2.36), (0.25, 0.25, 0.075), material("Diffuser", (0.9, 0.75, 0.5), 0.08, 0.22))


def scene_three(m):
    amber = material("Deep olive glass", (0.12, 0.25, 0.18), 0.1, 0.14, 0.22, 0.46)
    gold = material("Brushed brass", (0.61, 0.42, 0.22), 0.82, 0.2)
    cream = material("Warm ivory label", (0.84, 0.78, 0.63), 0.04, 0.48)
    ink = material("Deep ink", (0.035, 0.065, 0.05), 0.12, 0.3)
    lathe("Serum bottle / molded glass", [(0.46, 0.12), (0.55, 0.2), (0.56, 1.2), (0.51, 1.42), (0.28, 1.59), (0.27, 1.83), (0.23, 1.87)], amber)
    cylinder("Bottle foot glass", (0, 0, 0.18), 0.53, 0.12, amber, edge=0.035)
    cylinder("Neck collar", (0, 0, 1.82), 0.3, 0.11, gold, edge=0.018)
    cylinder("Precision cap", (0, 0, 2.13), 0.32, 0.51, gold, edge=0.045)
    torus("Cap lower ring", (0, 0, 1.93), 0.29, 0.025, cream)
    cube("Applied paper label", (0, -0.531, 0.84), (0.88, 0.035, 0.81), cream, 0.035)
    text_object("FORMA label", "FORMA", (0, -0.555, 0.95), 0.17, ink)
    text_object("LAB label", "BOTANICAL Nº 04", (0, -0.557, 0.72), 0.073, ink)
    cube("Label fine rule", (0, -0.557, 0.55), (0.43, 0.008, 0.012), gold, 0)


def scene_four(m):
    body = material("Warm gray polymer", (0.31, 0.36, 0.32), 0.24, 0.3, coat=0.28)
    grille = material("Acoustic textile", (0.035, 0.048, 0.042), 0.05, 0.82)
    metal = material("Control ring", (0.58, 0.62, 0.55), 0.78, 0.24)
    accent = material("Signal green", (0.46, 0.62, 0.42), 0.42, 0.24)
    cube("Portable speaker shell", (0.25, 0, 1.05), (2.5, 0.8, 1.38), body, 0.28)
    cube("Inset acoustic grille", (0.25, -0.414, 1.05), (2.0, 0.035, 0.92), grille, 0.18)
    for ix in range(7):
        for iz in range(5):
            sphere("Grille perforation", (-0.56 + ix * 0.27, -0.439, 0.72 + iz * 0.16), (0.017, 0.009, 0.017), metal, 16, 8)
    cylinder("Volume dial", (1.42, -0.43, 1.05), 0.22, 0.12, metal, rotation=(math.pi / 2, 0, 0), edge=0.025)
    cylinder("Volume center", (1.42, -0.505, 1.05), 0.105, 0.035, accent, rotation=(math.pi / 2, 0, 0), edge=0.01)
    for x in (-0.55, 1.05):
        cylinder("Port isolation foot", (x, 0, 0.31), 0.15, 0.09, grille)
    torus("Carry loop", (0.25, 0.05, 1.8), 0.44, 0.075, body, rotation=(math.pi / 2, 0, 0))
    cube("Charge port", (-0.93, -0.22, 0.66), (0.08, 0.15, 0.2), metal, 0.035)


def scene_five(m):
    steel = material("Polished watch steel", (0.52, 0.58, 0.55), 0.9, 0.17)
    case = material("Deep green enamel", (0.025, 0.09, 0.065), 0.38, 0.18, coat=0.5)
    face = material("Porcelain dial", (0.77, 0.72, 0.6), 0.17, 0.25)
    strap = material("Olive leather", (0.12, 0.17, 0.13), 0.03, 0.58)
    gold = material("Dial gold", (0.69, 0.48, 0.25), 0.84, 0.2)
    # Watch is staged on a slight tilt for an advertising composition.
    cube("Watch presentation riser", (0.7, 0.1, 0.12), (3.2, 1.8, 0.24), material("Dark mineral plinth", (0.055, 0.08, 0.07), 0.22, 0.36), 0.07)
    cylinder("Watch case", (0.8, -0.05, 1.34), 0.91, 0.28, steel, edge=0.06, rotation=(math.pi / 2, 0, 0))
    cylinder("Enamel bezel", (0.8, -0.24, 1.34), 0.82, 0.1, case, edge=0.035, rotation=(math.pi / 2, 0, 0))
    cylinder("Dial", (0.8, -0.31, 1.34), 0.7, 0.045, face, edge=0.012, rotation=(math.pi / 2, 0, 0))
    torus("Bezel polished rim", (0.8, -0.345, 1.34), 0.82, 0.035, gold, rotation=(math.pi / 2, 0, 0))
    for i in range(12):
        angle = 2 * math.pi * i / 12
        x, z = 0.8 + math.sin(angle) * 0.58, 1.34 + math.cos(angle) * 0.58
        cube("Applied hour marker", (x, -0.346, z), (0.045, 0.025, 0.12 if i % 3 == 0 else 0.075), gold, 0.008)
    # Hand-built subdial, center pin and hands read as precision parts.
    cylinder("Subdial", (0.8, -0.37, 1.02), 0.19, 0.02, face, edge=0.006, rotation=(math.pi / 2, 0, 0))
    torus("Subdial ring", (0.8, -0.39, 1.02), 0.18, 0.01, gold, rotation=(math.pi / 2, 0, 0))
    cube("Minute hand", (0.8, -0.39, 1.43), (0.018, 0.016, 0.56), steel, 0.006)
    cube("Hour hand", (0.64, -0.39, 1.24), (0.34, 0.016, 0.022), steel, 0.007)
    sphere("Hand pivot", (0.8, -0.4, 1.34), (0.055, 0.035, 0.055), gold, 24, 12)
    # Curved leather band above and below the case.
    curve("Upper leather strap", [(0.8, 0.56, 1.35), (0.8, 0.9, 1.4), (0.8, 1.35, 1.38), (0.8, 1.78, 1.34)], 0.29, strap)
    curve("Lower leather strap", [(0.8, -0.72, 1.34), (0.8, -1.03, 1.28), (0.8, -1.42, 1.25), (0.8, -1.78, 1.23)], 0.28, strap)
    for y in (0.96, 1.2, 1.44, -1.0, -1.25, -1.5):
        sphere("Strap stitch", (0.49, y, 1.52 if y > 0 else 1.39), (0.025, 0.035, 0.012), gold, 16, 8)
    cylinder("Crown stem", (1.75, -0.05, 1.35), 0.14, 0.24, steel, rotation=(0, math.pi / 2, 0), edge=0.025)
    torus("Crown knurl", (1.88, -0.05, 1.35), 0.12, 0.025, gold, rotation=(0, math.pi / 2, 0))
    text_object("Dial signature", "F / L", (0.8, -0.36, 1.19), 0.09, case, rotation=(math.pi / 2, 0, 0))


def scene_six(m):
    shell = material("Anodized graphite", (0.11, 0.15, 0.14), 0.56, 0.25, coat=0.3)
    edge = material("Machined titanium", (0.43, 0.49, 0.45), 0.86, 0.2)
    lens = material("Optical glass", (0.035, 0.16, 0.15), 0.35, 0.08, 0.44, 0.35)
    rubber = material("Grip elastomer", (0.025, 0.035, 0.031), 0.02, 0.62)
    indicator = material("Status light", (0.52, 0.73, 0.48), 0.1, 0.18)
    cube("Projector main chassis", (0.45, 0, 1.1), (2.7, 1.55, 1.55), shell, 0.22)
    cube("Projector top control deck", (0.45, 0, 1.92), (1.7, 1.12, 0.12), edge, 0.05)
    # Lens barrel is aligned toward the camera, with nested optical rings.
    for y, radius, depth, mat in [(-0.81, 0.55, 0.14, edge), (-0.91, 0.43, 0.16, rubber), (-1.02, 0.34, 0.12, edge), (-1.11, 0.27, 0.09, lens)]:
        cylinder("Nested projection lens", (1.12, y, 1.1), radius, depth, mat, rotation=(math.pi / 2, 0, 0), edge=0.025)
    torus("Lens focus indexing", (1.12, -0.97, 1.1), 0.37, 0.025, indicator, rotation=(math.pi / 2, 0, 0))
    for i in range(9):
        cube("Cooling fin", (-0.65 + i * 0.23, 0.68, 1.15), (0.12, 0.14, 0.68), edge, 0.025)
    for x in (-0.35, 1.15):
        cylinder("Precision focus control", (x, -0.61, 1.92), 0.14, 0.07, rubber, edge=0.016)
    for i in range(3):
        sphere("Status indicator", (0.1 + i * 0.19, -0.61, 1.935), (0.045, 0.035, 0.025), indicator, 20, 12)
    # Articulated kickstand and rear foot make the assembly visibly functional.
    curve("Adjustable support yoke", [(-0.78, -0.35, 0.39), (-0.9, -0.2, -0.05), (1.6, -0.2, -0.05), (1.5, -0.35, 0.39)], 0.07, edge)
    cube("Yoke hinge", (-0.75, -0.38, 0.43), (0.18, 0.22, 0.16), rubber, 0.04)
    cube("Rear I/O panel", (0.45, 0.79, 0.85), (1.5, 0.08, 0.38), rubber, 0.045)


def scene_seven(m):
    shell = material("Sculpted olive polymer", (0.16, 0.22, 0.17), 0.24, 0.22, coat=0.45)
    metal = material("Brushed champagne alloy", (0.59, 0.49, 0.34), 0.86, 0.18)
    cushion = material("Acoustic memory foam", (0.035, 0.047, 0.04), 0.02, 0.76)
    fabric = material("Woven ear mesh", (0.075, 0.095, 0.08), 0.08, 0.65)
    cube("Headphone display plinth", (0.9, 0.1, 0.11), (3.5, 1.75, 0.22), material("Basalt display", (0.045, 0.066, 0.057), 0.18, 0.36), 0.06)
    # The headband is a continuous, sculpted curve rather than a torus.
    curve("Formed spring steel headband", [(-0.05, 0, 1.68), (0.02, 0, 2.72), (0.75, 0, 3.27), (1.45, 0, 3.22), (2.02, 0, 2.72), (2.08, 0, 1.69)], 0.12, metal)
    curve("Padded underside of band", [(0.0, -0.012, 2.0), (0.12, -0.012, 2.73), (0.78, -0.012, 3.11), (1.42, -0.012, 3.06), (1.98, -0.012, 2.72), (2.12, -0.012, 2.0)], 0.075, cushion)
    for x, tilt in ((0.02, -0.12), (2.03, 0.12)):
        # Cup gimbal and stepped acoustic housing.
        cube("Headphone yoke", (x, -0.02, 1.84), (0.14, 0.22, 0.76), metal, 0.06)
        cylinder("Ear cup outer shell", (x, -0.1, 1.36), 0.68, 0.37, shell, edge=0.12)
        cylinder("CNC ear cup plate", (x, -0.32, 1.36), 0.51, 0.08, metal, edge=0.035)
        cylinder("Acoustic mesh", (x, -0.38, 1.36), 0.43, 0.045, fabric, edge=0.02)
        torus("Memory foam ear cushion", (x, -0.45, 1.36), 0.51, 0.13, cushion, rotation=(math.pi / 2, 0, 0))
        torus("Cup precision seam", (x, -0.22, 1.36), 0.57, 0.025, metal, rotation=(math.pi / 2, 0, 0))
        sphere("Cup pivot", (x, -0.04, 2.12), (0.12, 0.12, 0.12), shell, 32, 16)
        for i in range(5):
            torus("Acoustic grille trace", (x, -0.414, 1.36), 0.12 + i * 0.058, 0.008, metal, rotation=(math.pi / 2, 0, 0))
    cube("Hidden charging port", (2.72, 0, 1.22), (0.12, 0.22, 0.08), metal, 0.025)


BUILDERS = {1: scene_one, 2: scene_two, 3: scene_three, 4: scene_four, 5: scene_five, 6: scene_six, 7: scene_seven}


def aim(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


def add_area(name, loc, target, power, color, size, shape="DISK", size_y=None):
    data = bpy.data.lights.new(name, "AREA")
    data.energy = power
    data.color = color
    data.shape = shape
    data.size = size
    if size_y and shape == "RECTANGLE":
        data.size_y = size_y
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = loc
    aim(obj, target)
    return obj


def setup(scene_no):
    clear_scene()
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.eevee.taa_render_samples = 8
    scene.eevee.use_raytracing = True
    scene.render.resolution_x, scene.render.resolution_y = 800, 500
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.view_settings.exposure = 0
    scene.view_settings.gamma = 1
    scene.world.color = (0.018, 0.026, 0.022)
    world = scene.world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.018, 0.026, 0.022, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.28

    builders = BUILDERS[scene_no]
    builders(None)
    product_objects = [obj for obj in scene.objects if obj.type in {"MESH", "CURVE", "FONT"}]
    root = bpy.data.objects.new("Hero product turntable", None)
    bpy.context.collection.objects.link(root)
    root.location.x = 1.25 if scene_no != 1 else 1.2
    for obj in product_objects:
        obj.parent = root
    root.rotation_mode = "XYZ"
    scene.frame_start, scene.frame_end = 1, 49
    for frame, angle in ((1, -math.radians(3)), (25, math.radians(3)), (49, -math.radians(3))):
        root.rotation_euler.z = angle
        root.keyframe_insert(data_path="rotation_euler", index=2, frame=frame)
    if root.animation_data and root.animation_data.action:
        for fcurve in root.animation_data.action.fcurves:
            for point in fcurve.keyframe_points:
                point.interpolation = "BEZIER"
                point.handle_left_type = "AUTO_CLAMPED"
                point.handle_right_type = "AUTO_CLAMPED"
            fcurve.modifiers.new("CYCLES")

    floor = material("Cyclorama / deep botanical", (0.035, 0.052, 0.044), 0.12, 0.46)
    cube("Seamless studio floor", (0, 0, -0.22), (200, 200, 0.3), floor, 0)
    camera_data = bpy.data.cameras.new("Hero camera")
    camera = bpy.data.objects.new("Hero camera", camera_data)
    scene.collection.objects.link(camera)
    camera.location = (0.05, -10.5, 4.55)
    aim(camera, (0.15, 0.0, 1.5))
    camera_data.type = "ORTHO"
    camera_data.ortho_scale = 8.6
    scene.camera = camera
    camera_data.lens = 52

    add_area("Key / large warm softbox", (0.8, -4.2, 7.0), (1.3, 0, 1.15), 1050, (1.0, 0.78, 0.55), 5.3)
    add_area("Rim / cool vertical strip", (4.2, 1.4, 5.2), (1.4, 0, 1.5), 1450, (0.56, 0.78, 0.67), 3.3, "RECTANGLE", 0.75)
    add_area("Fill / soft frontal", (-2.5, -4.0, 3.0), (1.0, 0, 1.25), 390, (0.71, 0.82, 0.73), 4.0)
    add_area("Edge / amber bounce", (1.0, 2.5, 3.2), (1.3, 0, 1.1), 760, (0.86, 0.54, 0.29), 2.6, "RECTANGLE", 1.0)

    scene.render.image_settings.color_mode = "RGB"
    scene.render.resolution_percentage = 100
    scene.render.resolution_x, scene.render.resolution_y = 800, 500
    scene.camera.data.lens = 50
    scene.render.filepath = os.path.abspath(args.output)
    if args.mode in {"poster", "all"}:
        poster_path = os.path.abspath(args.output) if args.mode == "poster" else os.path.join(os.path.abspath(args.output), "poster.png")
        os.makedirs(os.path.dirname(poster_path), exist_ok=True)
        scene.render.resolution_x, scene.render.resolution_y = 1280, 800
        scene.eevee.taa_render_samples = 32
        scene.frame_set(1)
        scene.render.filepath = poster_path
        bpy.ops.render.render(write_still=True)
    if args.mode in {"frames", "all"}:
        frame_dir = os.path.abspath(args.output) if args.mode == "frames" else os.path.join(os.path.abspath(args.output), "frames")
        os.makedirs(frame_dir, exist_ok=True)
        scene.render.filepath = os.path.join(os.path.abspath(args.output), "frame_")
        scene.render.image_settings.file_format = "PNG"
        scene.eevee.taa_render_samples = 8
        scene.render.resolution_x, scene.render.resolution_y = 800, 500
        scene.render.fps = 12
        scene.frame_start, scene.frame_end = 1, 48
        scene.render.filepath = os.path.join(frame_dir, "frame_")
        scene.render.use_file_extension = True
    return scene


args = arguments()
scene = setup(args.scene)
if args.mode == "poster":
    bpy.ops.render.render(write_still=True)
else:
    bpy.ops.render.render(animation=True)
