const { Vector3, Quaternion, Matrix4, Euler } = THREE;

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
    const position = this.el.getAttribute('position');
    const side = this.el.getAttribute('side');
    const models = Array.from(document.querySelectorAll('[medialoader][networked]'));
    const _getDistance = m => m.el.object3D.position.distanceTo(position);
    const closestModels = models.sort((a, b) => _getDistance(a) - _getDistance(b));
    console.log('tick', this, closestModels, portalSides);
    if (closestModels.length > 0) {
      const closestModel = closestModels[0];
      portalSides[side] = closestModel;
    }
    /* if (!this.ikRoot) {
      return;
    } */
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