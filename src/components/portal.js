import {upload} from '../utils/media-utils.js';
import {proxiedUrlFor} from '../utils/media-url-utils.js';
const { Vector3, Quaternion, Matrix4, Euler } = THREE;

const localVector = new Vector3();
const localVector2 = new Vector3();
const localVector3 = new Vector3();
const localVector4 = new Vector3();
const localQuaternion = new Quaternion();
const localQuaternion2 = new Quaternion();
const localMatrix = new Matrix4();
const localMatrix2 = new Matrix4();

const portalSides = {
  left: null,
  right: null,
};
window.portalSides = portalSides;

AFRAME.registerComponent('portal', {
  /* schema: {
    camera: { type: "string", default: ".camera" },
    leftController: { type: "string", default: ".left-controller" },
    rightController: { type: "string", default: ".right-controller" }
  }, */
  update(oldData) {
    console.log('update', this, this.data, oldData);
    /* if (this.data.camera !== oldData.camera) {
      this.camera = this.el.querySelector(this.data.camera);
    }

    if (this.data.leftController !== oldData.leftController) {
      this.leftController = this.el.querySelector(this.data.leftController);
    }

    if (this.data.rightController !== oldData.rightController) {
      this.rightController = this.el.querySelector(this.data.rightController);
    } */
  },
  tick(time, dt) {
    const side = this.el.getAttribute('side');
    const viewingRig = document.getElementById('viewing-rig');
    if (side && !portalSides[side] && viewingRig) {
      if (side === 'left') {
        const position = this.el.getAttribute('position') || localVector.set(0, 0, 0);
        const medias = Array.from(document.querySelectorAll('[media-loader][networked]'));
        const _getDistance = m => m.object3D.position.distanceTo(position);
        const closestModels = medias.sort((a, b) => _getDistance(a) - _getDistance(b));
        if (closestModels.length > 0) {
          const closestModel = closestModels[0];
          if (_getDistance(closestModel) < 1) {
            closestModel.setAttribute('position', this.el.getAttribute('position'));
            closestModel.setAttribute('quaternion', this.el.getAttribute('quaternion'));
            // closestModel.setAttribute('scale', this.el.getAttribute('scale'));
            portalSides[side] = closestModel;
          }
        }
      } else if (side === 'right') {
        localMatrix
          .compose(this.el.getAttribute('position') || localVector.set(0, 0, 0), this.el.getAttribute('quaternion') || localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1))
          .premultiply(localMatrix2.getInverse(viewingRig.object3D.matrix))
          .premultiply(window.xrpackage.package.matrix)
          .decompose(localVector, localQuaternion, localVector2);
        
        const packages = window.xrpackage.packages.filter(p => p !== window.xrpackage.package);
        const _getDistance = p => {
          p.matrix.decompose(localVector3, localQuaternion2, localVector4);
          return localVector3.distanceTo(localVector);
        };
        const closestPackages = packages.sort((a, b) => _getDistance(a) - _getDistance(b));
        if (closestPackages.length > 0) {
          const closestPackage = closestPackages[0];
          closestPackage.matrix.decompose(localVector3, localQuaternion2, localVector4);
          if (_getDistance(closestPackage) < 1) {
            closestPackage.setMatrix(localMatrix);
            closestPackage.grabrelease();
            portalSides[side] = closestPackage;
          }
        }
      }

      const portalButton = document.querySelector('[portal-button]');
      portalButton.setAttribute('visible', Object.keys(portalSides).some(k => portalSides[k]));
    }
  },
});
AFRAME.registerComponent('portal-button', {
  /* schema: {
    camera: { type: "string", default: ".camera" },
    leftController: { type: "string", default: ".left-controller" },
    rightController: { type: "string", default: ".right-controller" }
  }, */
  update(oldData) {
    console.log('update portal button', this, this.data, oldData);
  },
  tick(time, dt) {
    // console.log('visible', this.el.getAttribute('visible'));
    const viewingRig = document.getElementById('viewing-rig');
    if (this.el.getAttribute('visible') && viewingRig) {
      const {xrSession} = this.el.sceneEl;
      // console.log('got xr session', xrSession);
      if (xrSession) {
        const {inputSources} = xrSession;
        // console.log('got input sources', inputSources);
        for (let i = 0; i < inputSources.length; i++) {
          const inputSource = inputSources[i];
          const {gamepad} = inputSource;
          if (gamepad && gamepad.buttons[0].pressed) {
            localMatrix
              .compose(this.el.getAttribute('position') || localVector.set(0, 0, 0), this.el.getAttribute('quaternion') || localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1))
              .premultiply(localMatrix2.getInverse(viewingRig.object3D.matrix))
              .premultiply(window.xrpackage.package.matrix)
              .decompose(localVector, localQuaternion, localVector2);
            if (portalSides.left) {
              console.log('portal side left', portalSides.left);
              // nothing
            } else if (portalSides.right) {
              console.log('portal side right', portalSides.right);
              /* portalSides.right.upload()
                .then(hash => {
                  console.log('got hash', hash, `https://ipfs.exokit.org/ipfs/${hash}.wbn`);
                }); */
              const d = portalSides.right.getMainData();
              const type = 'model/gltf-binary';
              const b = new Blob([d], {type});
              upload(b, type)
                .then(response => {
                  // console.log('upload done', j);

                  const srcUrl = new URL(proxiedUrlFor(response.origin));
                  srcUrl.searchParams.set("token", response.meta.access_token);
                  
                  const portals = Array.from(document.querySelectorAll('[portal]'));
                  const leftPortal = portals.filter(portal => portal.getAttribute('side') === 'left')[0];
                  
                  console.log('got portals', portals, leftPortal);
                  
                  const entity = document.createElement('a-entity');
                  entity.setAttribute("media-loader", { resolve: false, src: srcUrl.href, fileId: response.file_id });
                  entity.setAttribute("networked", { template: "#interactable-media" } );
                  entity.setAttribute('position', leftPortal.getAttribute('position') || localVector.set(0, 0, 0));
                  entity.setAttribute('quaternion', leftPortal.getAttribute('quaternion') || localQuaternion.set(0, 0, 0, 1));
                  AFRAME.scenes[0].appendChild(entity);
                  
                  console.log('add entity', entity);
                });
              window.xrpackage.remove(portalSides.right);
              portalSides.right = null;
              // this.el.setAttribute('visible', false);
            }
            break;
          }
        }
      }
      // console.log('got tick', time, dt);
      /* const position = this.el.getAttribute('position');
      const side = this.el.getAttribute('side');
      const models = Array.from(document.querySelectorAll('[medialoader][networked]'));
      const _getDistance = m => m.el.object3D.position.distanceTo(position);
      const closestModels = models.sort((a, b) => _getDistance(a) - _getDistance(b));
      console.log('tick', this, closestModels, portalSides);
      if (closestModels.length > 0) {
        const closestModel = closestModels[0];
        portalSides[side] = closestModel;
      } */
    }
  },
});