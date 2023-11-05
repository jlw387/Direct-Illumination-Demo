uniform vec3 objColor;
uniform vec3 lightDir;
uniform vec3 lightColor;
uniform float k_a;
uniform float k_d;
uniform float k_s;
uniform float n_s;

varying vec3 fPosition;
varying vec3 fNormal;
varying vec3 fCameraPos;

void main() {
   float n_dot_l = dot(normalize(fNormal), normalize(lightDir));

   if(n_dot_l < 0.0) {
      n_dot_l = 0.0;
   }

   vec3 reflect =  normalize(reflect(-lightDir, fNormal));
   vec3 view = normalize(fCameraPos - fPosition);

   float r_dot_v = dot(reflect, view); 

   if(r_dot_v < 0.0) {
      r_dot_v = 0.0;
   }

   vec4 ambient_comp = vec4(k_a * objColor, 1.0);
   vec4 diffuse_comp = vec4(k_d * n_dot_l * objColor, 1.0);
   vec4 specular_comp = vec4(k_s * pow(r_dot_v, n_s) * lightColor, 1.0);

   gl_FragColor =  ambient_comp + diffuse_comp + specular_comp; 
}