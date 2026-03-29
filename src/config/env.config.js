/**
 * wardApp Centralized Environment Configuration
 * 
 * Este archivo centraliza todas las variables de entorno del frontend para facilitar
 * el mantenimiento y asegurar que se usen los valores correctos en cada ambiente.
 */

export const config = {
  // URL base de la API. Prioriza la variable de entorno NEXT_PUBLIC_API_URL.
  // En desarrollo local por defecto usa http://localhost:3001/api
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  
  // Entorno actual (development, production, etc)
  env: process.env.NODE_ENV || 'development',
  
  // Otras configuraciones del cliente pueden agregarse aquí
};

export default config;
