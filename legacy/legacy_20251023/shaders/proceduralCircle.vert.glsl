// src/shaders/proceduralCircle.vert.glsl
#define PI 3.14159265359

attribute float a_progress;
attribute float a_side;

uniform float u_width;
uniform vec3 u_center;
uniform float u_radius;

varying vec2 vUv; // Pasamos UV al fragment shader para el fuego

vec3 getCirclePoint(float progress) {
    float angle = progress * 2.0 * PI;
    return u_center + vec3(cos(angle) * u_radius, sin(angle) * u_radius, 0.0);
}

void main() {
    vUv = vec2(a_progress, a_side * 0.5 + 0.5);

    vec3 currentPoint = getCirclePoint(a_progress);
    vec3 nextPoint = getCirclePoint(a_progress + 0.001);
    
    vec2 tangent = normalize(nextPoint.xy - currentPoint.xy);
    vec2 normal = vec2(-tangent.y, tangent.x);

    vec3 final_pos = currentPoint + vec3(normal * a_side * u_width * 0.5, 0.0);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(final_pos, 1.0);
}