// braidedRing.vert.glsl (Versión Final - Curvas de Bézier)

attribute float a_progress;
attribute float a_side;

uniform sampler2D uPositionTexture;
uniform float uControlPointsCount;
uniform float uRibbonWidth;
uniform float uArcHeight;
uniform float uOffsetDirection;

vec3 getParticlePos(float index) {
    return texture2D(uPositionTexture, vec2(index / uControlPointsCount, 0.0)).rgb;
}

// Función para calcular un punto en una curva de Bézier cúbica
vec3 cubicBezier(vec3 p0, vec3 p1, vec3 p2, vec3 p3, float t) {
    float t2 = t * t;
    float t3 = t2 * t;
    float mt = 1.0 - t;
    float mt2 = mt * mt;
    float mt3 = mt2 * mt;
    return p0*mt3 + 3.0*p1*mt2*t + 3.0*p2*mt*t2 + p3*t3;
}

void main() {
    // 1. Determinar el segmento actual y el progreso dentro de él
    float totalProgress = a_progress * uControlPointsCount;
    float particleIndex = floor(totalProgress);
    float segmentProgress = fract(totalProgress);

    // 2. Obtener las 4 partículas que definen las tangentes de nuestro segmento
    vec3 p0 = getParticlePos(mod(particleIndex - 1.0 + uControlPointsCount, uControlPointsCount));
    vec3 p1 = getParticlePos(mod(particleIndex, uControlPointsCount)); // Punto de inicio del segmento
    vec3 p2 = getParticlePos(mod(particleIndex + 1.0, uControlPointsCount)); // Punto final del segmento
    vec3 p3 = getParticlePos(mod(particleIndex + 2.0, uControlPointsCount));

    // 3. ¡LA LÓGICA CLAVE! Calcular los 4 puntos de control para la curva de Bézier
    
    // La tangente en el punto de inicio (p1) depende de sus vecinos (p0, p2)
    vec3 tangent1 = normalize(p2 - p0);
    // La tangente en el punto final (p2) depende de sus vecinos (p1, p3)
    vec3 tangent2 = normalize(p3 - p1);

    // La "fuerza" de la curva
    float controlLength = distance(p1, p2) * 0.55;

    // Puntos de control de la curva base
    vec3 bp0 = p1;
    vec3 bp1 = p1 + tangent1 * controlLength;
    vec3 bp2 = p2 - tangent2 * controlLength;
    vec3 bp3 = p2;

    // 4. Aplicar el desplazamiento (interior/exterior) a los puntos de control
    vec3 normal1 = normalize(vec3(-tangent1.y, tangent1.x, 0.0));
    vec3 normal2 = normalize(vec3(-tangent2.y, tangent2.x, 0.0));

    bp1 += normal1 * uArcHeight * uOffsetDirection;
    bp2 += normal2 * uArcHeight * uOffsetDirection;

    // 5. Calcular la posición final en la curva de Bézier
    vec3 final_pos = cubicBezier(bp0, bp1, bp2, bp3, segmentProgress);

    // 6. Extruir la cinta (lógica de la normal)
    vec3 next_pos = cubicBezier(bp0, bp1, bp2, bp3, segmentProgress + 0.01);
    vec2 tangent2D = normalize(vec2(next_pos.xy - final_pos.xy));
    vec2 ribbon_normal = vec2(-tangent2D.y, tangent2D.x);

    vec3 pos = final_pos + vec3(ribbon_normal * a_side * uRibbonWidth, 0.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}