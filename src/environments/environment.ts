export const environment = {
  production: false,
  /**
   * Porta do HospitalSaoJose.Api em desenvolvimento. É a mesma tanto no
   * `dotnet run` (perfil `http` do launchSettings.json) quanto ao executar o
   * .exe direto do bin/, que ignora o launchSettings e cai no padrão do
   * Kestrel — os dois precisam bater, senão o site chama uma porta morta.
   * O appsettings.Development.json do backend já libera http://localhost:4200
   * em Cors:AllowedOrigins, então não é preciso proxy no ng serve.
   */
  apiBaseUrl: 'http://localhost:5000',
};
