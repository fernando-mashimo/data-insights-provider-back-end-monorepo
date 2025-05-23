# Welcome to DeltaAI backend monorepo

## Requirements

1. [Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
2. [Configure your AWS CLI credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html)
3. Install NodeJs 20.18.0
4. [Install AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html)
5. [Install Visual Studio Code](https://code.visualstudio.com/)
6. Open this project in Visual Studio Code and install the recommended extensions.

## Getting Started

1. Clone this repository
2. Do all the requirements

## Documentation

- [Getting Started with AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/home.html)
  - [CDK Reference](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-construct-library.html)
- [Getting Started with AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html)
- [Overall Architecture](https://excalidraw.com/#room=7d48cdcfbb084fdc1c67,HP7Ftq5iio-hqxUzn4eC_A)

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

## Testing Locally
As this stack is using many AWS services, it is recommended to test the stack in the AWS environment. However you can test the lambda functions locally connected to real AWS services, as long as you have the AWS CLI configured with permissions to access the services.

As lambda handler are just node script, you can test it locally using jest tests.

We recommend the following steps to test the "use cases" and "input/output adapters" locally:
1. Get the AWS CLI environment variables credentials.
2. Add them to the `.env` file in the root of the project.
3. Create a new jest test, and test your real classes (call them, make expect of it, to easily rerun).
4. Run the jest test normally.
5. Delete or comment the test to avoid running it on production.

After that you can make the deploy to the AWS environment, and test the infrastructure.

## Folder Structure

```bash
bin/                # Contains cdk executable scripts
lib/                # Contains common infrastructure and lambda useful classes, like: constructors, helpers, etc.
src/                # Main source code directory
└── <name>-module/  # Specific module for the project
    ├── domain/     # Domain layer containing business logic, and interfaces
    │   ├── entities/       # Business entities
    │   ├── errors/         # Custom error definitions
    │   ├── repositories/   # Interfaces for data access
    │   ├── services/       # Interfaces for domain services
    │   ├── messages/       # Interfaces for domain messages
    │   ├── queues/         # Interfaces for domain queue
    │   ├── schedulers/     # Interfaces for domain schedulers
    │   └── useCases/       # Application use cases, using defined interfaces
    ├── adapters/   # Adapters for different input/output interfaces
    │   ├── input/          # Input adapters
    │   │   ├── helpers/            # Helper functions for input
    │   │   ├── http-api-gateway/   # HTTP API Gateway handlers
    │   │   ├── async/              # Async request handlers (cron)
    │   │   ├── sns/                # SNS handlers
    │   │   ├── sqs/                # SQS handlers
    │   │   └── schedule/           # Schedule handlers
    │   ├── output/         # Output adapters
    │   │   ├── helpers/           # Helper functions for output
    │   │   ├── database/          # Database access implementations
    │   │   ├── file/              # File system access implementations
    │   │   ├── sns/               # Message producer implementations using SNS
    │   │   ├── sqs/               # Queue implementations using SQS
    │   │   └── http/              # HTTP implementations
    │   └── infrastructure/  # External services adapters
    ├── test-mock/   # Common test-mocking resources
    └── infrastructure/  # CDK infrastructure setup
        └── index/       # Entry point for CDK stack
```
