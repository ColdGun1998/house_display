import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';


const  createGrass = async () => {
    // 使用草坪图片制作材质覆盖到场景中
    return new Promise((resolve)=>{
        let loader = new THREE.TextureLoader(); 
        loader.load( 'https://p3.dcarimg.com/img/tos-cn-i-dcdx/0d280288fd2b4435bf20b11477066fc2~0x0.image',(groundTexture)=>{
            groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
            groundTexture.repeat.set( 25, 25 );
            groundTexture.anisotropy = 16;
    
            var groundMaterial = new THREE.MeshLambertMaterial( { map: groundTexture } );
            var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 20000, 20000 ), groundMaterial );
            mesh.position.y = - 250;
            mesh.rotation.x = - Math.PI / 2;
            mesh.receiveShadow = true;
            return resolve(mesh)
        });
    })
    
}


const createHouse = async ()=>{
    return new Promise((resolve)=>{
        let draco = new DRACOLoader('/libs/gl');
        draco.setDecoderPath();
        let loader = new GLTFLoader(); 
        loader.setDRACOLoader(draco);
        loader.load( '/models/cloudybox.glb',(gltf)=>{
            console.log('加载成功')
            gltf.scene.position.y = -250;
            gltf.scene.position.x = 0;
            gltf.scene.position.z = 0;
            gltf.scene.scale.set(10,10,10)
            return resolve(gltf.scene);
        });

    })
}



const render = () => {
    renderer.render(scene, camera);
}


let scene,renderer,camera,raycaster,mouse;


const Scene = ()=>{
    const containerRef = useRef(null);
    const init = useCallback(()=>{
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setClearColor(0xcce0ff );
        renderer.setSize(window.innerWidth, window.innerHeight);

        containerRef.current.appendChild(renderer.domElement);
 
		renderer.shadowMap.enabled = true;

        scene = new THREE.Scene();
        scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );
        

        camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.set( 1000, 50, 1500)
        camera.lookAt(scene.position);

        scene.add( new THREE.AmbientLight( 0x666666 ) );
        // 创建一个平行光线,可以产生投影,第一个参数表示光线的颜色,16进制默认为白色,第二个表示光的强度,默认1
		let light = new THREE.DirectionalLight( 0xdfebff, 1 );
 
				// 设置光线从(50,200,100) 到 (0,0,0) 沿着这条线照射
				light.position.set( 50, 200, 100 );
 
				// 将光线的向量与所传入的标量1.3进行相乘。 具体用途 TODO?
				light.position.multiplyScalar( 1.3 );
 
				//castShadow 如果设置为 true 该平行光会产生动态阴影。 警告: 这样做的代价比较高而且需要一直调整到阴影看起来正确
				light.castShadow = true;
 
				// 设置阴影贴图的宽度和高度
				light.shadow.mapSize.width = 1024;
				light.shadow.mapSize.height = 1024;
 
				var d = 300;
 
				// 在光的世界里。这用于生成场景的深度图;从光的角度来看，其他物体背后的物体将处于阴影中。
				light.shadow.camera.left = - d;
				light.shadow.camera.right = d;
				light.shadow.camera.top = d;
				light.shadow.camera.bottom = - d;
				light.shadow.camera.far = 1000;
				scene.add( light );

                //鼠标空间
                const controls = new OrbitControls(camera,renderer.domElement);//创建控件对象
                controls.addEventListener('change', render);//监听鼠标、键盘事件

                //
                raycaster = new THREE.Raycaster();
                mouse = new THREE.Vector2();
    },[containerRef])
    
    useEffect(()=>{
       init();
       Promise.all([createGrass(),createHouse()]).then((values)=>{
            values.forEach((val)=>scene.add(val));
            render();
       })
       
    },[])


    return <div ref={containerRef}></div>
}

export default Scene