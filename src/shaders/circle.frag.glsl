// src/shaders/circle.frag.glsl

uniform float u_time;
uniform float u_noiseScale;
uniform float u_noiseSpeed;
uniform float u_distortionIntensity;
varying vec2 vUv;

// --- ¡CORRECCIÓN! MOVEMOS LAS FUNCIONES DE AYUDA AL PRINCIPIO ---

// Función SDF para un anillo 2D
float sdfAnnulus(vec2 p, float radius, float thickness) {
    return abs(length(p) - radius) - thickness / 2.0;
}

// Funciones de ruido procedural (FBM)
vec2 hash( vec2 p ) {
	p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );
	return -1.0 + 2.0 * fract(sin(p)*43758.5453123);
}

float noise( in vec2 p ) {
    vec2 i = floor( p );
    vec2 f = fract( p );
	vec2 u = f*f*(3.0-2.0*f);
    return mix( mix( dot( hash( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                     dot( hash( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( hash( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                     dot( hash( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float freq = 1.0;
    for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p * freq);
        freq *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

// --- FUNCIÓN PRINCIPAL ---
// Ahora que las funciones de ayuda están definidas, main() puede usarlas sin problemas.
void main() {
    vec2 p = vUv - 0.5;

    // --- 1. Creamos un campo de coordenadas giratorio ---
    float angle = u_time * u_noiseSpeed * 0.5; // Hacemos la rotación un poco más lenta
    mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    vec2 rotatedP = rotationMatrix * p;

    // --- 2. Distorsión de la Forma (con animación) ---
    // ¡CORRECCIÓN AQUÍ! Añadimos u_time para que el patrón de ruido evolucione
    vec2 distortionVec = rotatedP * u_noiseScale + u_time * u_noiseSpeed;
    vec2 distortedP = p + fbm(distortionVec) * u_distortionIntensity;
    
    // --- 3. La Forma Base (SDF) ---
    float thickness = 0.05; 
    float radius = 0.5 - thickness / 2.0; 
    float dist = sdfAnnulus(distortedP, radius, thickness);
    
    float alpha = 1.0 - smoothstep(-0.005, 0.005, dist);
    if (alpha < 0.01) {
        discard;
    }

    // --- 4. Textura de Fuego para el Color ---
    // Usamos las mismas coordenadas base para la coherencia
    float firePattern = fbm(rotatedP * u_noiseScale * 1.5 + u_time * u_noiseSpeed);
    firePattern = smoothstep(-0.3, 0.4, firePattern);

    // --- 5. Gradiente de Color ---
    vec3 color1 = vec3(0.0, 0.1, 0.5);
    vec3 color2 = vec3(0.5, 0.0, 0.5);
    vec3 color3 = vec3(1.0, 0.2, 0.0);
    vec3 color4 = vec3(1.0, 1.0, 0.8);

    vec3 finalColor = mix(color1, color2, smoothstep(0.0, 0.3, firePattern));
    finalColor = mix(finalColor, color3, smoothstep(0.2, 0.6, firePattern));
    finalColor = mix(finalColor, color4, smoothstep(0.5, 0.8, firePattern));

    // --- 6. Borde de Resplandor ---
    float innerGlow = 1.0 - smoothstep(0.0, 0.2, dist);
    finalColor += innerGlow * vec3(1.0, 1.0, 1.0) * 0.2;

    gl_FragColor = vec4(finalColor, alpha);
}