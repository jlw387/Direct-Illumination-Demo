varying vec3 fPosition;
varying vec3 fNormal;
varying vec3 fCameraPos;

void main() {
    fPosition = position;
    fNormal = normal;
    fCameraPos = cameraPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}