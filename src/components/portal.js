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
      localMatrix
        .compose(this.el.getAttribute('position') || localVector.set(0, 0, 0), this.el.getAttribute('quaternion') || localQuaternion.set(0, 0, 0, 1), localVector2.set(1, 1, 1))
        .premultiply(localMatrix2.getInverse(viewingRig.object3D.matrix))
        .premultiply(window.xrpackage.package.matrix)
        .decompose(localVector, localQuaternion, localVector2);
      
      if (side === 'left') {
        const medias = Array.from(document.querySelectorAll('[medialoader][networked]'));
        const _getDistance = m => m.el.object3D.position.distanceTo(position);
        const closestModels = medias.sort((a, b) => _getDistance(a) - _getDistance(b));
        if (closestModels.length > 0) {
          const closestModel = closestModels[0];
          if (_getDistance(closestPackage) < 0.3) {
            closestModel.setAttribute('position', this.getAttribute('position'));
            closestModel.setAttribute('quaternion', this.getAttribute('quaternion'));
            closestModel.setAttribute('scale', this.getAttribute('scale'));
            portalSides[side] = closestModel;
          }
        }
      } else if (side === 'right') {
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
  },
});