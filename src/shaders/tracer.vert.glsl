// tracer.vert.glsl (Versión Final y Correcta)

#define PI 3.14159265359

attribute float a_progress;
attribute float a_side;
attribute vec4 a_customData;

uniform float u_time;
uniform float u_trailLength;

varying vec3 v_color;

// Función que calcula un punto en un círculo de radio 1.0 centrado en el origen.
// Este es nuestro "plano" o forma base en espacio local.
vec3 getLocalCirclePoint(float progress) {
    float angle = progress * 2.0 * PI;
    return vec3(cos(angle), sin(angle), 0.0);
}

void main() {
    // Extraemos los datos de la instancia
    v_color = a_customData.rgb;
    float direction = a_customData.a;

    float speed = 0.5;
    float headProgress = fract(u_time * speed * direction);
    
    float pointProgress = headProgress - a_progress * u_trailLength;

    // 1. Obtenemos la posición del vértice en la forma base (un círculo en el origen)
    vec3 local_pos = getLocalCirclePoint(pointProgress);
    
    // 2. Calculamos la tangente para la cinta en el espacio local
    vec3 next_local_pos = getLocalCirclePoint(pointProgress + 0.001);
    vec2 tangent = normalize(next_local_pos.xy - local_pos.xy);
    vec2 normal = vec2(-tangent.y, tangent.x);
    
    float ribbonWidth = 0.08;
    
    // Desplazamos el vértice para darle grosor a la cinta
    local_pos += vec3(normal * a_side * ribbonWidth, 0.0);
    
    // 3. Aplicamos todas las transformaciones en el orden correcto
    // La 'instanceMatrix' que pasamos desde JS contiene la POSICIÓN y ESCALA (radio).
    // La 'modelViewMatrix' que nos da Three.js contiene la ROTACIÓN de nuestro wheelGroup.
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(local_pos, 1.0);
}