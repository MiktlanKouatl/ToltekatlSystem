// src/shaders/fire.frag.glsl

// Uniforms que recibimos desde TypeScript
uniform float u_time;
uniform float u_noiseScale;
uniform float u_noiseSpeed;
uniform float u_distortionIntensity;

// Varyings que recibimos del vertex shader
varying vec2 vUv;

// --- FUNCIONES DE AYUDA (DEFINIDAS ANTES DE MAIN) ---

// Función SDF que define un anillo 2D
float sdfAnnulus(vec2 p, float radius, float thickness) {
    return abs(length(p) - radius) - thickness / 2.0;
}

// Funciones para generar ruido procedural de alta calidad (FBM)
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
void main() {
    // Coordenadas UV centradas en el plano (-1 a 1 para RibbonLine, -0.5 a 0.5 para Plano)
    // El vUv de la cinta va de 0 a 1 en 'x' (progreso) y 0 a 1 en 'y' (ancho)
    vec2 p = vec2(vUv.x, vUv.y - 0.5); // Centramos la coordenada Y

    // --- 1. Campo de coordenadas giratorio ---
    float angle = u_time * u_noiseSpeed;
    mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    vec2 rotatedP = rotationMatrix * (vUv * 2.0 - 1.0); // Usamos UVs de -1 a 1 para rotación centrada

    // --- 2. Distorsión de la Forma ---
    // La distorsión se aplica al grosor de la cinta, no a la forma general del círculo
    // (La forma del círculo ya es procedural en el vertex shader)

    // --- 3. La Forma Base (El Ancho de la Cinta) ---
    // Simulamos un SDF para el ancho de la cinta usando vUv.y
    float distToCenter = abs(p.y); // Distancia al centro de la cinta
    float alpha = 1.0 - smoothstep(0.4, 0.5, distToCenter); // Borde suave
     if (alpha < 0.01) {
        discard;
    }

    // --- 4. Textura de Fuego para el Color (FBM) ---
    float firePattern = fbm(rotatedP * u_noiseScale + u_time * u_noiseSpeed);
    firePattern = smoothstep(-0.3, 0.4, firePattern);

    // --- 5. Gradiente de Color ---
    vec3 color1 = vec3(0.0, 0.1, 0.5);
    vec3 color2 = vec3(0.5, 0.0, 0.5);
    vec3 color3 = vec3(1.0, 0.2, 0.0);
    vec3 color4 = vec3(1.0, 1.0, 0.8);

    vec3 finalColor = mix(color1, color2, smoothstep(0.0, 0.3, firePattern));
    finalColor = mix(finalColor, color3, smoothstep(0.2, 0.6, firePattern));
    finalColor = mix(finalColor, color4, smoothstep(0.5, 0.8, firePattern));
    
    // El resplandor ahora viene de la propia alpha suave
    finalColor *= (1.0 + (1.0 - smoothstep(0.0, 0.5, distToCenter)) * 1.5);

    gl_FragColor = vec4(finalColor, alpha);
}