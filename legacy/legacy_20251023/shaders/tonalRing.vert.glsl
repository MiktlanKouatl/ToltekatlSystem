// tonalRing.vert.glsl (Versión 7.1 - "S" Robusta)

attribute float a_progress;
attribute float a_side;

uniform sampler2D uPositionTexture;
uniform float uControlPointsCount;
uniform float uRibbonWidth;
uniform float uPocketRadius;

vec3 getParticlePos(float index) {
    return texture2D(uPositionTexture, vec2(index / uControlPointsCount, 0.0)).rgb;
}

vec3 catmullRom(vec3 p0, vec3 p1, vec3 p2, vec3 p3, float t) {
    vec3 v0 = (p2 - p0) * 0.5;
    vec3 v1 = (p3 - p1) * 0.5;
    float t2 = t * t;
    float t3 = t * t * t;
    return (2.0*p1 - 2.0*p2 + v0 + v1)*t3 + (-3.0*p1 + 3.0*p2 - 2.0*v0 - v1)*t2 + v0*t + p1;
}

void main() {
    // 1. Determinar entre qué partículas estamos
    float totalProgress = a_progress * uControlPointsCount;
    float particleIndex = floor(totalProgress);
    float segmentProgress = fract(totalProgress);

    // 2. Obtener las dos partículas que definen nuestro segmento
    vec3 p1 = getParticlePos(mod(particleIndex, uControlPointsCount));
    vec3 p2 = getParticlePos(mod(particleIndex + 1.0, uControlPointsCount));

    // 3. ¡NUEVA LÓGICA! Calcular puntos de control procedurales y estables
    vec3 midpoint = (p1 + p2) * 0.5;
    vec3 dirToCenter = normalize(midpoint);
    vec3 tangent = vec3(-dirToCenter.y, dirToCenter.x, 0.0);

    // Los puntos de control que crean la "S"
    vec3 c1 = midpoint - tangent * uPocketRadius;
    vec3 c2 = midpoint + tangent * uPocketRadius;

    // 4. Dibujar la curva Catmull-Rom a través de los puntos correctos
    // La curva ahora va de la partícula p1, a través de c1 y c2, hasta la partícula p2
    vec3 final_pos = catmullRom(p1, c1, c2, p2, segmentProgress);

    // La tangente para la orientación de la cinta
    vec3 next_pos = catmullRom(p1, c1, c2, p2, segmentProgress + 0.01);
    vec2 tangent2D = normalize(vec2(next_pos.xy - final_pos.xy));
    vec2 normal = vec2(-tangent2D.y, tangent2D.x);

    vec3 pos = final_pos + vec3(normal * a_side * uRibbonWidth, 0.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}


/* 
attribute float a_progress;
attribute float a_side;

uniform sampler2D uPositionTexture;
uniform float uControlPointsCount;
uniform float uRibbonWidth;

// Leemos la posición final directamente de la textura
vec3 getControlPoint(float index) {
    return texture2D(uPositionTexture, vec2(index / uControlPointsCount, 0.0)).rgb;
}

// La función de Catmull-Rom no cambia
vec3 catmullRom(vec3 p0, vec3 p1, vec3 p2, vec3 p3, float t) {
    vec3 v0 = (p2 - p0) * 0.5;
    vec3 v1 = (p3 - p1) * 0.5;
    float t2 = t * t;
    float t3 = t * t * t;
    return (2.0*p1 - 2.0*p2 + v0 + v1)*t3 + (-3.0*p1 + 3.0*p2 - 2.0*v0 - v1)*t2 + v0*t + p1;
}

void main() {
    // La lógica de interpolación no cambia
    float totalProgress = a_progress * uControlPointsCount;
    float segmentIndex = floor(totalProgress);
    float segmentProgress = fract(totalProgress);

    vec3 p0 = getControlPoint(mod(segmentIndex - 1.0 + uControlPointsCount, uControlPointsCount));
    vec3 p1 = getControlPoint(mod(segmentIndex + 0.0, uControlPointsCount));
    vec3 p2 = getControlPoint(mod(segmentIndex + 1.0, uControlPointsCount));
    vec3 p3 = getControlPoint(mod(segmentIndex + 2.0, uControlPointsCount));

    vec3 final_pos = catmullRom(p0, p1, p2, p3, segmentProgress);
    
    vec3 next_pos = catmullRom(p0, p1, p2, p3, segmentProgress + 0.01);
    vec2 tangent = normalize(vec2(next_pos.xy - final_pos.xy));
    vec2 normal = vec2(-tangent.y, tangent.x);

    vec3 pos = final_pos + vec3(normal * a_side * uRibbonWidth, 0.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
} */