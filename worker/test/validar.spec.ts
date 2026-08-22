import { describe, expect, it } from 'vitest';
import { limpiarCabecera, validar } from '../src/validar';

const bueno = {
  nombre: 'Ana Torres',
  email: 'ana@empresa.com',
  mensaje: 'Hola, vimos tu portafolio y queremos hablar de una vacante backend.',
};

describe('validar', () => {
  it('acepta un mensaje correcto y normaliza', () => {
    const r = validar({ ...bueno, nombre: '  Ana Torres  ', email: 'ANA@Empresa.com' });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.datos.nombre).toBe('Ana Torres');
      expect(r.datos.email).toBe('ana@empresa.com');
    }
  });

  it('rechaza lo que no es un objeto', () => {
    for (const v of [null, 'texto', 42, undefined]) {
      expect(validar(v).ok).toBe(false);
    }
  });

  it('el campo trampa se distingue de un error de validación', () => {
    const r = validar({ ...bueno, web: 'http://spam.example' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toBe('trampa');
  });

  it('exige un mensaje con sustancia', () => {
    const r = validar({ ...bueno, mensaje: 'hola' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.campo).toBe('mensaje');
  });

  it('pone techo a cada campo', () => {
    const r = validar({ ...bueno, mensaje: 'x'.repeat(5000) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toBe('demasiado-largo');
  });

  it('rechaza correos evidentemente malos', () => {
    for (const email of ['sinarroba', 'a@b', 'a@b.', '@empresa.com', 'a b@c.com']) {
      const r = validar({ ...bueno, email });
      expect(r.ok, email).toBe(false);
    }
  });

  it('acepta direcciones válidas poco comunes', () => {
    for (const email of ['a+etiqueta@sub.dominio.pe', "o'brien@correo.io", 'x_y-z@a.co']) {
      expect(validar({ ...bueno, email }).ok, email).toBe(true);
    }
  });
});

describe('limpiarCabecera', () => {
  it('impide inyectar cabeceras con saltos de línea', () => {
    const sucio = 'Ana\r\nBcc: victima@ejemplo.com';
    expect(limpiarCabecera(sucio)).not.toMatch(/[\r\n]/);
    expect(limpiarCabecera(sucio)).toBe('Ana Bcc: victima@ejemplo.com');
  });
  it('recorta lo excesivamente largo', () => {
    expect(limpiarCabecera('x'.repeat(300)).length).toBe(120);
  });
});
