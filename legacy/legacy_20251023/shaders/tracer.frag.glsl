// Un fragment shader simple para darles color
varying vec3 v_color; // <-- ¡NUEVO! Recibimos el color

void main() {
    gl_FragColor = vec4(v_color, 0.6); // Usamos el color y una opacidad
}