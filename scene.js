export function mountScene(host) {
  if (!host || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas=document.createElement('canvas'); canvas.className='scene-canvas'; canvas.setAttribute('aria-hidden','true');
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'}); if(!gl)return;
  const vert='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const frag=[
'precision highp float;',
'uniform vec2 resolution;uniform float time;uniform float mobile;',
'mat2 rotate(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}',
'float box(vec3 p,vec3 size,float radius){vec3 q=abs(p)-size;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-radius;}',
'vec2 map(vec3 p){',
'vec3 q=p;q.xz=rotate(sin(time*.19)*.17+.23)*q.xz;',
'float cube=box(q-vec3(-.93,.76,.13),vec3(.69,.69,.69),.075);',
'float ball=length(q-vec3(.82,1.07,.31))-.91;',
'float tube=max(length((q-vec3(.12,.86,-1.55)).xz)-.38,abs(q.y-.86)-.85);',
'vec2 d=vec2(p.y+.04,0.);',
'if(cube<d.x)d=vec2(cube,1.);if(ball<d.x)d=vec2(ball,2.);if(tube<d.x)d=vec2(tube,3.);return d;',
'}',
'vec3 normal(vec3 p){vec2 e=vec2(.003,0.);return normalize(vec3(map(p+e.xyy).x-map(p-e.xyy).x,map(p+e.yxy).x-map(p-e.yxy).x,map(p+e.yyx).x-map(p-e.yyx).x));}',
'float shadow(vec3 p,vec3 l){float s=1.,t=.04;for(int i=0;i<26;i++){float h=map(p+l*t).x;s=min(s,12.*h/t);t+=clamp(h,.035,.24);if(h<.001||t>8.)break;}return clamp(s,.20,1.);}',
'void main(){',
'vec2 uv=(gl_FragCoord.xy-.5*resolution)/min(resolution.x,resolution.y);uv.y+=mobile*.25;',
'vec3 eye=vec3(3.3,2.35,mix(6.7,8.7,mobile)),target=vec3(0.,.88,0.);',
'vec3 ww=normalize(target-eye),uu=normalize(cross(ww,vec3(0.,1.,0.))),vv=cross(uu,ww);',
'vec3 rd=normalize(uv.x*uu+uv.y*vv+1.6*ww),ro=eye;',
'float t=0.,hit=0.;vec2 result=vec2(0.);',
'for(int i=0;i<80;i++){vec3 p=ro+rd*t;result=map(p);if(result.x<.002){hit=1.;break;}t+=result.x*.83;if(t>19.)break;}',
'vec3 color=mix(vec3(.035,.054,.049),vec3(.11,.13,.115),smoothstep(-.8,1.2,uv.y));',
'if(hit>0.){',
'vec3 p=ro+rd*t,n=normal(p),v=normalize(ro-p);',
'vec3 l=normalize(vec3(-.7,1.45,1.1)),l2=normalize(vec3(.75,.75,-1.));',
'float diffuse=max(dot(n,l),0.),fill=max(dot(n,l2),0.);float sh=shadow(p+n*.015,l);',
'vec3 albedo=result.y<.5?vec3(.09,.115,.103):result.y<1.5?vec3(.35,.39,.33):result.y<2.5?vec3(.65,.67,.61):vec3(.30,.43,.39);',
'float metallic=result.y>1.5?.94:result.y>.5?.53:.08;',
'color=albedo*(.24+diffuse*.72*sh+fill*.20);',
'vec3 reflectDir=reflect(-v,n);',
'float spec=pow(max(dot(reflect(-l,n),v),0.),mix(24.,78.,metallic));',
'float strip=pow(max(0.,1.-abs(reflectDir.x+reflectDir.y*.38-.18)*1.65),10.);',
'float moving=pow(max(dot(reflectDir,normalize(vec3(.2+sin(time*.3)*.48,.75,.72))),0.),24.);',
'color+=metallic*(vec3(.57,.66,.61)*strip*.64+vec3(.66,.69,.59)*moving*.40);',
'color+=vec3(.73,.74,.67)*spec*.24*sh;',
'color+=vec3(.11,.19,.17)*pow(1.-max(dot(n,v),0.),4.)*metallic;',
'if(result.y<.5)color*=.8;',
'float fog=1.-exp(-.016*t*t);color=mix(color,vec3(.09,.11,.10),fog*.42);',
'}',
'color=pow(max(color,vec3(0.)),vec3(.91));color*=1.-.15*dot(uv,uv);gl_FragColor=vec4(color,1.);',
'}'
].join('\n');
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null;}
  const vs=shader(gl.VERTEX_SHADER,vert),fs=shader(gl.FRAGMENT_SHADER,frag);if(!vs||!fs)return;
  const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;
  const data=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,data);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  gl.useProgram(program);const pos=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  const r=gl.getUniformLocation(program,'resolution'),tim=gl.getUniformLocation(program,'time'),m=gl.getUniformLocation(program,'mobile');
  host.append(canvas);let frame=0,last=0,visible=true;
  const observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false;});observer.observe(host);
  function draw(t){
    if(!canvas.isConnected){observer.disconnect();return;}
    frame=requestAnimationFrame(draw);
    if(!visible||document.hidden||t-last<55)return;
    last=t;
    const ratio=Math.min(devicePixelRatio||1,innerWidth<700?.58:.78),bounds=host.getBoundingClientRect();
    const w=Math.min(1250,Math.round(bounds.width*ratio)),h=Math.min(850,Math.round(bounds.height*ratio));
    if(!w||!h)return;
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
    gl.uniform2f(r,w,h);gl.uniform1f(tim,t*.001);gl.uniform1f(m,innerWidth<800?1.:0.);
    gl.drawArrays(gl.TRIANGLES,0,6);host.classList.add('scene-live');
  }
  frame=requestAnimationFrame(draw);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);host.classList.remove('scene-live');canvas.remove();observer.disconnect();},{once:true});
}
