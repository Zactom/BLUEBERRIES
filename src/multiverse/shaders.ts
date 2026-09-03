// GLSL shader sources for the Blueberry Multiverse

// ── Common noise function (simplex-like) ──────────────────────────
export const noiseGLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}

float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(
    i.z+vec4(0.0,i1.z,i2.z,1.0))
    +i.y+vec4(0.0,i1.y,i2.y,1.0))
    +i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

float fbm(vec3 p){
  float v=0.0;
  float a=0.5;
  for(int i=0;i<5;i++){
    v+=a*snoise(p);
    p*=2.0;
    a*=0.5;
  }
  return v;
}
`;

// ── Berry vertex shader ── deforms an icosahedron with noise ──
export const berryVertexShader = /* glsl */ `
uniform float uTime;
uniform float uDistortion;
uniform float uPulse;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;
${noiseGLSL}

void main(){
  vec3 pos = position;
  float n = fbm(pos*1.5 + uTime*0.3);
  float n2 = snoise(pos*3.0 + uTime*0.5);
  float displacement = (n*0.5 + n2*0.3) * uDistortion;
  displacement += sin(uTime*2.0 + pos.y*4.0)*0.05*uPulse;
  pos += normal * displacement;
  vDisplacement = displacement;
  vNormal = normalize(normalMatrix * normal);
  vPosition = pos;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
}
`;

// ── Berry fragment shader ── deep indigo skin with cyan rim glow ──
export const berryFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uPulse;
uniform vec3 uMouse;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;

void main(){
  vec3 baseColor = mix(vec3(0.02,0.0,0.08), vec3(0.10,0.02,0.25), vDisplacement*2.0+0.5);
  vec3 berryColor = mix(baseColor, vec3(0.20,0.05,0.45), smoothstep(0.0,0.3,vDisplacement));

  // rim light
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
  rim = pow(rim, 2.0);
  vec3 rimColor = mix(vec3(0.02,0.71,0.83), vec3(0.66,0.27,0.97), sin(uTime*0.5)*0.5+0.5);
  berryColor += rimColor * rim * (1.5 + uPulse);

  // bloom-like glow on bumps
  float bump = smoothstep(0.0,0.15,vDisplacement);
  berryColor += vec3(0.4,0.15,0.8)*bump*0.3;

  // mouse proximity glow
  float mouseDist = distance(vPosition, uMouse);
  float mouseGlow = smoothstep(1.5,0.0,mouseDist)*0.5;
  berryColor += vec3(0.06,0.71,0.83)*mouseGlow;

  gl_FragColor = vec4(berryColor, 1.0);
}
`;

// ── Tunnel vertex shader ── for tube geometry ──
export const tunnelVertexShader = /* glsl */ `
uniform float uTime;
uniform float uDistortion;
varying vec2 vUv;
varying vec3 vPosition;
${noiseGLSL}

void main(){
  vec3 pos = position;
  float n = snoise(vec3(pos.xy*0.5, uTime*0.2));
  pos.z += n * uDistortion * 0.3;
  vUv = uv;
  vPosition = pos;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
}
`;

// ── Tunnel fragment shader ── recursive molecular lattice ──
export const tunnelFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uWarp;
uniform float uOpacity;
varying vec2 vUv;
varying vec3 vPosition;

void main(){
  vec2 uv = vUv;
  uv.y += uTime*0.1*uWarp;

  // hexagonal lattice
  vec2 grid = fract(uv*vec2(20.0,30.0));
  float hex = step(0.15,grid.x)*step(grid.x,0.85)*step(0.15,grid.y)*step(grid.y,0.85);
  float pulse = sin(uTime*2.0 + uv.y*20.0)*0.5+0.5;

  vec3 color1 = vec3(0.10,0.02,0.30);
  vec3 color2 = vec3(0.66,0.27,0.97);
  vec3 color3 = vec3(0.02,0.71,0.83);

  vec3 col = mix(color1, color2, hex*pulse);
  col = mix(col, color3, smoothstep(0.0,0.3,fract(uv.y*5.0+uTime*0.3)));

  // depth fade
  float depth = smoothstep(0.0,1.0,vUv.y);
  col *= depth;

  // chromatic aberration
  float ca = 0.003*uWarp;
  float r = step(0.15,fract(uv.x*20.0+ca))*step(fract(uv.x*20.0+ca),0.85);
  float b = step(0.15,fract(uv.x*20.0-ca))*step(fract(uv.x*20.0-ca),0.85);
  col.r += r*0.1;
  col.b += b*0.1;

  gl_FragColor = vec4(col*uOpacity, uOpacity);
}
`;

// ── Fluid simulation fragment shader ── churning indigo ocean ──
export const fluidFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uWarp;
uniform float uOpacity;
uniform vec2 uResolution;
${noiseGLSL}

void main(){
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 p = uv - 0.5;
  p.x *= uResolution.x / uResolution.y;

  float t = uTime*0.15*uWarp;

  // layered noise for viscous fluid
  float n1 = fbm(vec3(p*2.0, t));
  float n2 = fbm(vec3(p*4.0 + n1, t*1.5));
  float n3 = fbm(vec3(p*8.0 + n2, t*2.0));

  vec3 deep = vec3(0.03,0.0,0.12);
  vec3 mid = vec3(0.15,0.03,0.35);
  vec3 bright = vec3(0.40,0.10,0.60);
  vec3 highlight = vec3(0.66,0.27,0.97);
  vec3 cyan = vec3(0.02,0.71,0.83);

  vec3 col = mix(deep, mid, smoothstep(-0.5,0.5,n1));
  col = mix(col, bright, smoothstep(0.0,0.8,n2));
  col = mix(col, highlight, smoothstep(0.3,0.7,n3)*0.5);
  col += cyan * smoothstep(0.6,1.0,n3) * 0.3;

  // vignette
  float vig = 1.0 - length(p)*0.6;
  col *= vig;

  gl_FragColor = vec4(col*uOpacity, uOpacity);
}
`;

// ── Particle vertex shader ── for point sprites ──
export const particleVertexShader = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uWarp;
attribute float aScale;
attribute vec3 aColor;
varying vec3 vColor;
varying float vAlpha;

void main(){
  vColor = aColor;
  vec3 pos = position;

  // orbital motion
  float angle = uTime*0.5*uWarp + aScale*6.28;
  pos.x += sin(angle)*aScale*2.0;
  pos.y += cos(angle*0.7)*aScale*2.0;
  pos.z += sin(angle*0.5)*aScale*2.0;

  vec4 mvPosition = modelViewMatrix * vec4(pos,1.0);
  gl_PointSize = uSize * aScale * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
  vAlpha = smoothstep(0.0,50.0,-mvPosition.z);
}
`;

// ── Particle fragment shader ── soft glowing dots ──
export const particleFragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;

void main(){
  vec2 uv = gl_PointCoord - 0.5;
  float dist = length(uv);
  float alpha = smoothstep(0.5,0.0,dist);
  alpha = pow(alpha, 2.0);
  gl_FragColor = vec4(vColor, alpha*vAlpha);
}
`;

// ── Fullscreen post-process chromatic aberration + bloom ──
export const postVertexShader = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
`;

export const postFragmentShader = /* glsl */ `
uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uAberration;
varying vec2 vUv;

void main(){
  vec2 uv = vUv;
  vec2 dir = uv - 0.5;
  float dist = length(dir);
  float aberration = uAberration * dist;

  float r = texture2D(tDiffuse, uv + dir*aberration).r;
  float g = texture2D(tDiffuse, uv).g;
  float b = texture2D(tDiffuse, uv - dir*aberration).b;

  vec3 col = vec3(r,g,b);

  // bloom approximation
  vec3 bloom = texture2D(tDiffuse, uv+vec2(0.002,0.0)).rgb;
  bloom += texture2D(tDiffuse, uv-vec2(0.002,0.0)).rgb;
  bloom += texture2D(tDiffuse, uv+vec2(0.0,0.002)).rgb;
  bloom += texture2D(tDiffuse, uv-vec2(0.0,0.002)).rgb;
  bloom *= 0.25;
  col += bloom*0.5;

  // scanline
  col *= 0.95 + 0.05*sin(uv.y*800.0);

  // vignette
  col *= 1.0 - dist*0.4;

  gl_FragColor = vec4(col, 1.0);
}
`;
