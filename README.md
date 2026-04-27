# Amparo Frontend

The Amparo Frontend is a welcoming, accessible, and responsive React SPA built for the Amparo project. It connects Caregivers and Elders, allowing them to manage their care relationships and share updates via a feed.

## Accomplishments & Features

- **Authentication**: Secure login and signup flows using JWT authentication (persisted locally).
- **Feed**: Interactive feed with infinite scrolling to browse posts and updates.
- **Post Creation**: Widget to share text and image updates with the community.
- **Relationship Management**: "Meus Vínculos" (My Links) area to manage connections between Caregivers and Elders.
- **Profile**: User profile display showing role-specific information.
- **Responsive Design**: Mobile-first architecture ensuring accessibility on all devices.
- **Theming**: Cohesive "care/health" aesthetic using TailwindCSS and Shadcn/UI components.

## Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS (v3) + Shadcn/UI + Lucide React
- **State Management**: React Query (TanStack Query v5) + Zustand
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Backend running on `http://localhost:8000`

### Installation

1. Clone the repository and navigate to the frontend folder:
   ```bash
   cd AMPARO_FRONTEND
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment:
   Create a `.env` file in the root of `AMPARO_FRONTEND` (optional, defaults to localhost):
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

### Running the App

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

## Key Flows

- **Login**: Navigate to `/login` to authenticate.
- **Feed**: After login, the `/feed` displays posts. Use the widget at the top to create new posts.
- **Links**: Go to `/links` to view your connections. Use the "+" button to request a new link (requires Elder ID).

## Quality Assurance

- **Linting**: Run `npm run lint` to check for code quality issues.
- **Type Checking**: The build process includes TypeScript validation.

## Pipeline CI/CD & Deploy na Nuvem

Para que o pipeline de CI/CD funcione corretamente, siga estes passos:

1.  **Conta AWS**: Crie uma conta na AWS.
2.  **Usuário IAM**: Crie um usuário IAM com privilégios necessários (ECS, ECR, S3, IAM ou AdministratorAccess).
3.  **Configuração Local**: Configure suas credenciais localmente no seu terminal (usando `aws configure`).
4.  **GitHub Secrets**: No seu repositório GitHub, vá em *Settings > Secrets and variables > Actions* e adicione as chaves `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` do usuário IAM criado.
5.  **Infraestrutura**: Navegue até a pasta de infraestrutura (`AMPARO_INFRA`) e execute os comandos do Terraform para provisionar os recursos:
    ```bash
    terraform init
    terraform plan
    terraform apply
    ```
6.  **Deploy**: Realize um `commit` e `push` para o repositório. Isso disparará automaticamente o workflow que construirá a imagem Docker, fará o push para o cloud (ECR) e atualizará os serviços (ECS).

