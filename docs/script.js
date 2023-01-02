const start = Date.now();
let font = null;
let resized = false;
let spiral = null;
let scene = null;
let camera = null;
let renderer = null;
let canvas = null;
let controls = null;

const beta = false;

// blue
// 209°, 100%, 32%
// #0054a2
const colorBG = new THREE.Color().setHSL(209 / 360, 1, 0.32);

const manager = new THREE.LoadingManager();

// shpere
const radius = 10;
const turns = 6;
const objectsPerTurn = 25;

const angleStep = (Math.PI * 2) / objectsPerTurn;
const heightStep = 0.5;

const heightOffset = (heightStep * (turns * objectsPerTurn)) / 2;

// Calculate the slope of the spiral
const slope = (objectsPerTurn * heightStep) / radius / (Math.PI * 2);

const fontSize = 2;

manager.onLoad = function () {
  // when all resources are loaded
  init();
  render();
};

const loader = new THREE.FontLoader(manager);
loader.load(
  "https://cdn.jsdelivr.net/npm/three@0.147.0/examples/fonts/droid/droid_sans_bold.typeface.json",
  (response) => {
    font = response;
  }
);

// resize event listener
window.addEventListener("resize", function () {
  resized = true;
});

function getTextGeometries(msg) {
  const text = msg.toUpperCase();
  const textGeometries = [];

  for (let i = 0; i < text.length; i++) {
    const textGeo = new THREE.TextGeometry(text[i], {
      font: font,

      size: fontSize,
      height: 0,
      curveSegments: 12,

      bevelThickness: 0,
      bevelSize: 0,
      bevelEnabled: false,
    });

    textGeometries.push(textGeo);
  }

  return textGeometries.reverse();
}

function init() {
  // create instances of scene, camera and renderer
  canvas = document.getElementById("c");

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  spiral = new THREE.Group();
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(0, 5, 30);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(colorBG);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();

  // This code adds a grid to the scene if the beta flag is true.
  if (beta) {
    scene.add(new THREE.GridHelper(20, 10));
  }

  const texts = getTextGeometries("Happy new year! ");

  const degrees90 = Math.PI / 2;

  for (let i = 0; i < turns * objectsPerTurn; i++) {
    const geom = texts[i % texts.length];
    geom.center();

    const hueOffset = Math.sin((i / (turns * objectsPerTurn)) * Math.PI * 2);

    const letter = new THREE.Mesh(
      geom,
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(colorBG).offsetHSL(
          0,
          0,
          hueOffset * -0.4 - 0.01
        ),
      })
    );

    // position
    letter.position.set(
      Math.cos(angleStep * i) * radius,
      heightOffset - heightStep * i,
      Math.sin(angleStep * i) * radius
    );

    // rotation
    letter.rotation.y = 0 - angleStep * i + degrees90;

    letter.rotation.z = slope;

    spiral.add(letter);
  }

  scene.add(spiral);
  animate();
}

function animate() {
  render();
  requestAnimationFrame(animate);
}

function updateSize() {
  // update the size
  renderer.setSize(window.innerWidth, window.innerHeight);

  // update the camera
  const canvas = renderer.domElement;
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
}

function render() {
  if (resized) {
    updateSize();
    resized = false;
  }

  const now = Date.now();

  spiral.position.z = Math.sin((start - now) * 0.001) * 30;

  spiral.rotation.x = Math.sin((start - now) * 0.0008) * 0.85;
  spiral.rotation.z = Math.sin((start - now) * 0.0005) * 0.55;
  spiral.rotation.y = (start - now) * 0.0008;

  renderer.render(scene, camera);
}
