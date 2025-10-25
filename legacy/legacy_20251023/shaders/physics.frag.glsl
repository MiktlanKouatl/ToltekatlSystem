// physics.frag.glsl

uniform sampler2D u_positions;
uniform float u_particleCount;
uniform float u_restLength;
uniform float u_springStiffness;
uniform float u_damping;
uniform float u_deltaTime;
uniform float u_radialStiffness;
uniform float u_radialRestLengths[20];

void main() {
    float particleIndex = gl_FragCoord.x;
    float uv_x = particleIndex / u_particleCount;
    
    vec4 self = texture2D(u_positions, vec2(uv_x, 0.0));
    vec3 pos = self.rgb;
    vec3 vel = vec3(self.a, 0.0, 0.0);

    vec3 totalForce = vec3(0.0);

    // --- Resortes de Conexión ---
    float prevIndex = mod(particleIndex - 1.0 + u_particleCount, u_particleCount);
    float nextIndex = mod(particleIndex + 1.0, u_particleCount);
    vec3 prevPos = texture2D(u_positions, vec2(prevIndex / u_particleCount, 0.0)).rgb;
    vec3 nextPos = texture2D(u_positions, vec2(nextIndex / u_particleCount, 0.0)).rgb;
    
    vec3 deltaPrev = prevPos - pos;
    totalForce += normalize(deltaPrev) * (length(deltaPrev) - u_restLength) * u_springStiffness;
    
    vec3 deltaNext = nextPos - pos;
    totalForce += normalize(deltaNext) * (length(deltaNext) - u_restLength) * u_springStiffness;

    // --- Resorte Radial ---
    /*
    float radialRestLength = u_radialRestLengths[int(particleIndex)];
    float distFromCenter = length(pos);
    totalForce += normalize(pos) * (radialRestLength - distFromCenter) * u_radialStiffness;
     */
    // --- Integración de Físicas ---
    totalForce -= vel * u_damping;
    vec3 newVel = vel + totalForce * u_deltaTime;
    vec3 newPos = pos + newVel * u_deltaTime;

    gl_FragColor = vec4(newPos, newVel.x);
}