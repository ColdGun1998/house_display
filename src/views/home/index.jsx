import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { useNavigate } from 'react-router-dom';
import { BoxGeometry } from 'three';

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


const createBricks = async ()=>{
    // 使用草坪图片制作材质覆盖到场景中
    return new Promise((resolve)=>{
        let loader = new THREE.TextureLoader(); 
        let bricks = new THREE.Group();
        loader.load( 'https://p3.dcarimg.com/img/tos-cn-i-dcdx/fb9442d24dbb4958ac67c90034bd18c5~0x0.image',(brickTexture)=>{
         
            for (let i = 0;i<5;i++){
                let brickMaterial = new THREE.MeshLambertMaterial( { map: brickTexture } );
                let mesh = new THREE.Mesh(new THREE.BoxGeometry( 100, 100, 100 ), brickMaterial );
                mesh.position.y = -200;
                mesh.position.x = 0 + i*150 + 20*Math.random();
                mesh.position.z = 0 + 500*(Math.random()-0.5);
               
                bricks.add(mesh);
               
            }

            for (let i = 0;i<5;i++){
                let brickMaterial = new THREE.MeshLambertMaterial( { map: brickTexture } );
                let mesh = new THREE.Mesh(new THREE.BoxGeometry( 100, 100, 100 ), brickMaterial );
                mesh.position.y = -200;
                mesh.position.x = -700+ i*150 + 20*Math.random();
                mesh.position.z = 0 + 800*(Math.random()-0.5);
                
                bricks.add(mesh)
              
            }
            
            return resolve(bricks)
        });
    })
}

 const render = () => {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}


let scene,renderer,camera,raycaster,mouse;


const Home = ()=>{
    const containerRef = useRef(null);
    const navigate = useNavigate();
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

        //鼠标
        const controls = new OrbitControls(camera,renderer.domElement);//创建控件对象
        controls.addEventListener('change', render);//监听鼠标、键盘事件

        //
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();
               
    },[containerRef])

    const onMouseClick = useCallback(( event )=> {
        //通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
    
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
        // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
        raycaster.setFromCamera( mouse, camera );
    
        // 获取raycaster直线和所有模型相交的数组集合
        var intersects = raycaster.intersectObjects( scene.children );

    
        //将所有的相交的模型的颜色设置为红色，如果只需要将第一个触发事件，那就数组的第一个模型改变颜色即可
        for ( var i = 0; i < intersects.length; i++ ) {
            if(intersects[0].object.geometry instanceof BoxGeometry){
                navigate('/scene')
                // intersects[ 0].object.material.color.set( 0xff0000 );
            }
             
        }
        
    
    },[]) 
    
    useEffect(()=>{
      init();
       Promise.all([createGrass(),createBricks()]).then((values)=>{
           values.forEach((val)=>scene.add(val));
           render();
       })
       window.addEventListener( 'click', onMouseClick, false );
    },[])



    return <div ref={containerRef}></div>
}

export default Home