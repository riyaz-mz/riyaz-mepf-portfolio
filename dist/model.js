import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {SVGRenderer} from './vendor/renderers/SVGRenderer.js';

export function createModel(container,onSelect){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas=document.createElement('canvas');
  let context;try{context=canvas.getContext('webgl2',{antialias:true,alpha:true});}catch{}
  const software=!context;
  const renderer=software?new SVGRenderer():new THREE.WebGLRenderer({canvas,context,antialias:true,alpha:true,powerPreference:'low-power'});
  if(software){renderer.setPrecision(1);renderer.setQuality('low');renderer.setClearColor(new THREE.Color(0xe9eae4));}
  else{
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  }
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.35;
  container.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','3D concept building: orbit with drag, zoom with scroll or pinch. Use the discipline buttons for an accessible alternative.');
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(34,1,.1,180);
  const initial=new THREE.Vector3(24,19,25);
  camera.position.copy(initial);
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.target.set(0,4,0);
  controls.enableDamping=!reduced&&!software;controls.dampingFactor=.08;
  controls.minDistance=13;controls.maxDistance=65;controls.maxPolarAngle=Math.PI*.47;controls.minPolarAngle=.28;
  controls.enablePan=false;
  scene.add(new THREE.HemisphereLight(0xffffff,0xb4b69f,2.6));
  const sun=new THREE.DirectionalLight(0xfff8e9,software?.82:4.4);
  sun.position.set(-10,23,14);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-18;sun.shadow.camera.right=18;
  sun.shadow.camera.top=18;sun.shadow.camera.bottom=-18;sun.shadow.normalBias=.04;
  scene.add(sun);scene.add(new THREE.AmbientLight(0xffffff,.5));
  const root=new THREE.Group();scene.add(root);
  const systemGroups={electrical:[],mechanical:[],plumbing:[],fire:[]};
  const floors=[],architecture=[],pickables=[];
  const material=(color,metalness=0,roughness=.65,opacity=1)=>new THREE.MeshStandardMaterial({color,metalness,roughness,transparent:opacity<1,opacity,side:THREE.DoubleSide});
  const mats={
    slab:material(0xd6d8cd,0,.85),wall:material(0xe9e9df),frame:material(0x58625a,.5,.4),
    glass:material(0xc9d4cf,.05,.15,.18),tray:material(0xb8bcb5,.8,.35),
    copper:material(0xb37a3d,.65,.37),duct:material(0x90a4a9,.65,.4),water:material(0x388d7c,.4,.45),
    fire:material(0xb45443,.4,.5),light:material(0xffffed,.1,.3),board:material(0xa8b4a7,.5,.4),
    dark:material(0x687365,.5,.5),rack:material(0x879185,.6,.5),pallet:material(0xc1a679,0,.9)
  };
  mats.light.emissive=new THREE.Color(0xfff0ce);mats.light.emissiveIntensity=.3;
  function addMesh(geometry,mat,parent,pos,sys){
    const mesh=new THREE.Mesh(geometry,mat);
    if(pos)mesh.position.set(...pos);
    mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);
    if(sys){mesh.userData.system=sys;pickables.push(mesh);}
    else{mesh.userData.baseOpacity=mat.opacity;architecture.push(mesh);}
    return mesh;
  }
  function box(w,h,d,mat,parent,x,y,z,sys){return addMesh(new THREE.BoxGeometry(w,h,d),mat,parent,[x,y,z],sys);}
  function line(a,b,r,mat,parent,sys){
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),v=end.clone().sub(start);
    const mesh=addMesh(new THREE.CylinderGeometry(r,r,v.length(),7),mat,parent,null,sys);
    mesh.position.copy(start.add(end).multiplyScalar(.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return mesh;
  }
  const pad=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.ShadowMaterial({color:0x3c4931,opacity:.13}));
  pad.rotation.x=-Math.PI/2;pad.position.y=-.51;pad.receiveShadow=true;if(!software)scene.add(pad);
  box(15.5,.5,10.4,mats.slab,root,0,-.25,0);
  const grid=new THREE.GridHelper(23,23,0xc4c9b9,0xd5d9cc);grid.position.y=-.49;grid.material.transparent=true;grid.material.opacity=.3;scene.add(grid);
  for(let f=0;f<2;f++){
    const group=new THREE.Group();group.position.y=f*3.65;group.userData.baseY=f*3.65;root.add(group);floors.push(group);
    box(14,.2,9,mats.slab,group,0,0,0);
    box(14,3.45,.13,mats.wall,group,0,1.8,-4.45);
    box(.13,3.45,9,mats.glass,group,-6.94,1.8,0);
    for(const x of [-6.8,-2.2,2.4,6.8])for(const z of [-4.3,4.3]){
      box(.15,3.6,.15,mats.frame,group,x,1.85,z);
      box(.12,.12,8.6,mats.frame,group,x,3.5,0);
    }
    for(const z of [-4.3,4.3])box(13.8,.14,.15,mats.frame,group,0,3.5,z);
    box(.14,2.55,4.1,mats.wall,group,-2.25,1.4,-2.25);
    box(4.5,2.55,.13,mats.glass,group,-4.6,1.4,-.2);
    for(let k=0;k<5;k++)box(.035,2.6,.04,mats.frame,group,-6.7+k*1.05,1.4,-.16);
    for(const x of [-5.6,-3.7])for(const z of [-2.8,-1.2]){
      box(1.1,.08,.64,mats.wall,group,x,.9,z);
      for(const dx of [-.45,.45])box(.035,.86,.04,mats.frame,group,x+dx,.44,z);
      box(.32,.27,.04,mats.frame,group,x,1.09,z-.18);
    }
    for(const x of [1.9,4.5])for(const z of [-2.7,-.3]){
      for(const dx of [-.65,.65])for(const dz of [-.4,.4])box(.055,2.4,.055,mats.rack,group,x+dx,1.3,z+dz);
      for(const h of [.45,1.3,2.15]){
        box(1.4,.045,.9,mats.rack,group,x,h,z);
        box(.9,.46,.6,mats.pallet,group,x,h+.26,z);
      }
    }
    // Each floor carries the same four service groups, so the model can open as a coordinated whole.
    const service={};for(const key of Object.keys(systemGroups)){service[key]=new THREE.Group();group.add(service[key]);systemGroups[key].push(service[key]);}
    const elec=service.electrical,mech=service.mechanical,water=service.plumbing,fire=service.fire;
    // Ladder tray with visible rungs and restrained copper conductors.
    for(const z of [.8,1.25])box(12.6,.1,.04,mats.tray,elec,0,2.98,z,'electrical');
    for(let x=-6.2;x<=6.2;x+=.34)box(.035,.03,.48,mats.tray,elec,x,2.95,1.025,'electrical');
    for(let k=0;k<5;k++)line([-6.2,3.02,.86+k*.073],[6.2,3.02,.86+k*.073],.023,mats.copper,elec,'electrical');
    for(const x of [-4.8,-1.5,2,5.3]){
      line([x,2.99,1.02],[x,2.99,3.5],.04,mats.copper,elec,'electrical');
      for(const z of [-2.2,.1,2.8]){
        box(1.12,.075,.27,mats.light,elec,x,2.62,z,'electrical');
        line([x,2.67,z],[x,3.35,z],.012,mats.frame,elec,'electrical');
      }
    }
    box(1.15,1.65,.26,mats.board,elec,-6.1,1.18,-4.16,'electrical');
    box(1.0,1.45,.035,mats.wall,elec,-6.1,1.18,-4.0,'electrical');
    for(let r=0;r<4;r++)for(let c=0;c<5;c++)box(.09,.12,.05,mats.dark,elec,-6.48+c*.19,.76+r*.27,-3.95,'electrical');
    line([-6.1,2,-4.02],[-6.1,3.02,-4.02],.06,mats.copper,elec,'electrical');
    line([-6.1,3.02,-4.02],[-6.1,3.02,1.02],.06,mats.copper,elec,'electrical');
    // Rectangular ducts, branches and ceiling terminals.
    box(12.7,.36,.6,mats.duct,mech,0,2.72,-.68,'mechanical');
    for(let x=-6;x<6;x+=.65)box(.028,.39,.63,mats.tray,mech,x,2.72,-.68,'mechanical');
    for(const x of [-5.3,-2.1,1.3,4.7]){
      box(.3,.27,3.2,mats.duct,mech,x,2.72,-2.3,'mechanical');
      box(.54,.12,.54,mats.duct,mech,x,2.49,-3.7,'mechanical');
      for(let t=0;t<5;t++)box(.4,.01,.025,mats.dark,mech,x,2.42,-3.86+t*.075,'mechanical');
    }
    // Water distribution with visible vertical connections.
    line([-6.4,2.2,-3.8],[6.4,2.2,-3.8],.065,mats.water,water,'plumbing');
    line([6.4,.3,-3.8],[6.4,3.65,-3.8],.085,mats.water,water,'plumbing');
    for(const x of [-4.5,.3,4.3])line([x,2.2,-3.8],[x,.65,-3.8],.045,mats.water,water,'plumbing');
    // Fire protection piping and conceptual sprinkler drops.
    line([-6.4,3.19,2.15],[6.4,3.19,2.15],.055,mats.fire,fire,'fire');
    for(const x of [-5.2,-1.8,1.6,5]){
      line([x,3.19,-2.9],[x,3.19,3.6],.035,mats.fire,fire,'fire');
      for(const z of [-2.8,.1,3.5]){
        line([x,3.19,z],[x,2.99,z],.02,mats.fire,fire,'fire');
        addMesh(new THREE.CylinderGeometry(.08,.05,.035,8),mats.tray,fire,[x,2.97,z],'fire');
      }
    }
    line([6.4,.2,2.15],[6.4,3.65,2.15],.065,mats.fire,fire,'fire');
  }
  // Stair, visible from the front of the section.
  const stairs=new THREE.Group();root.add(stairs);
  for(let i=0;i<16;i++)box(1.15,.13,.27,mats.slab,stairs,-5, .15+i*.226, .1+i*.235);
  line([-5.57,1,.1],[-5.57,4.4,3.63],.035,mats.frame,stairs);
  for(let i=0;i<8;i++)line([-5.57,.23+i*.452,.1+i*.47],[-5.57,1+i*.452,.1+i*.47],.02,mats.frame,stairs);
  const roof=new THREE.Group();root.add(roof);roof.userData.baseY=7.35;roof.position.y=7.35;
  box(14,.12,9,mats.wall,roof,0,0,0);
  for(let x=-6.5;x<7;x+=.4)box(.04,.035,9,mats.tray,roof,x,.08,0);
  const unit=box(2.2,.75,1.3,mats.duct,roof,3,.46,-1.9);
  for(let i=0;i<9;i++)box(1.6,.024,.045,mats.dark,roof,3,.7,-2.45+i*.13);
  const archMaterials=new Map();for(const mesh of architecture){const m=mesh.material;if(!archMaterials.has(m))archMaterials.set(m,{opacity:m.opacity,transparent:m.transparent});}
  let running=false,frameId,explode=.35;
  function resize(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);renderOnce();}
  function renderOnce(){if(!software)controls.update();renderer.render(scene,camera);}
  function frame(){if(!running)return;renderOnce();frameId=requestAnimationFrame(frame);}
  function resume(){if(!running){running=true;if(software)renderOnce();else frame();}}
  function pause(){running=false;cancelAnimationFrame(frameId);}
  function setSystem(key){
    const isolate=key!=='all';
    for(const [name,groups] of Object.entries(systemGroups))for(const g of groups)g.visible=!isolate||name===key;
    for(const [m,base] of archMaterials){m.transparent=isolate||base.transparent;m.opacity=isolate?Math.min(base.opacity,.24):base.opacity;m.depthWrite=!isolate;m.needsUpdate=true;}
    renderOnce();
  }
  function setExplode(value){explode=value;floors.forEach((f,i)=>f.position.y=f.userData.baseY+i*value*2.4);roof.position.y=roof.userData.baseY+value*5.2;roof.visible=value<.92;renderOnce();}
  function reset(){camera.position.copy(initial);controls.target.set(0,4,0);setExplode(.35);controls.update();}
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  let down={x:0,y:0};
  renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});
  renderer.domElement.addEventListener('pointerup',e=>{
    if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)return;
    const r=renderer.domElement.getBoundingClientRect();
    pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
    raycaster.setFromCamera(pointer,camera);
    const visible=pickables.filter(mesh=>{let p=mesh;while(p){if(!p.visible)return false;p=p.parent;}return true;});
    const hit=raycaster.intersectObjects(visible,false)[0];
    if(hit)onSelect(hit.object.userData.system);
  });
  controls.addEventListener('change',()=>{if(software&&running)renderOnce();});
  new ResizeObserver(resize).observe(container);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();pause();});
  resize();setExplode(explode);resume();
  return{resize,setSystem,setExplode,reset,resume,pause};
}
