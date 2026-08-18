export const environment = {
  production: false,
  /**
   * Porta padrão do `dotnet run` do HospitalSaoJose.Api. O
   * appsettings.Development.json do backend já libera http://localhost:4200
   * em Cors:AllowedOrigins, então não é preciso proxy no ng serve.
   */
  apiBaseUrl: 'http://localhost:5000',
};
