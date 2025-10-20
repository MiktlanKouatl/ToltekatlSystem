import * as THREE from 'three';
import { Text } from 'troika-three-text';
import { RibbonLineGPU } from './RibbonLineGPU';
import { RibbonConfig } from './RibbonLine';
import { RingHarmonizer } from './RingHarmonizer';
import { ToltekatlSystem, IToltekatlSystemState } from '../tonalpohualli-system/ToltekatlSystem';
import { NumeralGlyph } from './NumeralGlyph';

// Importamos el shader de fuego que usará cada cinta
import fireFragmentShader from '../shaders/fire.frag.glsl?raw';

export class RingView {
    public ribbons: RibbonLineGPU[] = [];
    public textLabels: Text[] = [];
    public numeralGlyphs: NumeralGlyph[] = [];
    private group: THREE.Group;

    constructor(group: THREE.Group) {
        this.group = group;

        for (let i = 0; i < 20; i++) {
            // --- Creación de los anillos (Ribbons) ---
            const config: RibbonConfig = {
                color: new THREE.Color(0xffffff),
                width: 0.1,
                maxLength: 128,
            };
            const ribbon = new RibbonLineGPU(config);
            ribbon.material.fragmentShader = fireFragmentShader;
            this.ribbons.push(ribbon);
            this.group.add(ribbon.mesh);

            // --- Creación de los textos con Troika ---
            const text = new Text();
            text.text = ToltekatlSystem.TONALES[i].name;
            text.fontSize = 0.2;
            text.color = 0xffffff;
            text.anchorX = 'center';
            text.anchorY = 'middle';
            text.sync();
            this.textLabels.push(text);
            this.group.add(text);

            // --- Creación de los glifos de numerales ---
            const glyph = new NumeralGlyph();
            this.numeralGlyphs.push(glyph);
            this.group.add(glyph);
        }
    }

    public update(harmonizer: RingHarmonizer, time: number, systemState: IToltekatlSystemState): void {
        const highlightedIndex = systemState.tonal.index;
        const absoluteDay = systemState.absoluteDay;

        for (let i = 0; i < 20; i++) {
            const ribbon = this.ribbons[i];
            const textLabel = this.textLabels[i];
            const glyph = this.numeralGlyphs[i];
            const position = harmonizer.positions[i];
            const scale = harmonizer.scales[i];
            const radius = scale * 0.5;

            // Actualizamos los uniforms de cada cinta
            ribbon.material.uniforms.u_center.value.copy(position);
            ribbon.material.uniforms.u_radius.value = radius;
            ribbon.material.uniforms.u_time.value = time;

            // Actualizamos la posición del texto
            textLabel.position.copy(position);
            textLabel.rotation.z = -this.group.rotation.z;

            // Lógica para resaltar el texto activo
            const isHighlighted = i === highlightedIndex;
            textLabel.color = isHighlighted ? 0xFFFFFF : 0x555555;

            // --- Lógica de los numerales ---
            const dayOffset = i - highlightedIndex;
            const targetDay = absoluteDay + dayOffset;
            const numeral = ((targetDay % 13) + 13) % 13 + 1; // Modulo robusto para negativos
            
            glyph.display(numeral);
            glyph.position.copy(position);
            glyph.position.y -= 0.25; // Desplazamos el glifo un poco hacia abajo del texto
            glyph.rotation.z = -this.group.rotation.z; // Contrarrotamos también el glifo
            glyph.visible = isHighlighted; // Solo mostramos el glifo del tonal activo
        }
    }
}