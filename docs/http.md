# Consumo de serviços HTTP

Visando garantir o desacoplamento e testabilidade dos componentes, foi implementada uma camada de abstração para chamadas de APIs (ou serviços HTTP).

Essa abstração possibilita a implementação de consumo a serviços HTTP, bem como a criação de *mocks* destes serviços durante os testes de componente.

## Implementando um HttpService

Assim como demais recursos do app, os serviços HTTP devem ser armazenados o mais próximo de onde serão utilizados, ou seja, dentro da feature o qual ele pertence.

Para criar um novo serviço de API, deve-se implementar uma classe herdando de `HttpService`.

> Lembre-se de seguir o [padrão de estrutura do projeto](./project-structure.md).

Exemplo de implementação mínima de uma classe de serviço: 

```ts
  /* /src/features/<minha-feature>/http/MyHttpService/index.ts */

  import { HttpService } from '~/http/HttpService';

  export class MyHttpService extends HttpService {
    // ...
  }
```

Por padrão, o construtor do `HttpService` aceita dois argumentos:

- `IHttpAdapter` (obrigatório) 
- `ErrorHandlerType` global (opcional).

> `IHttpAdapter` é a camada responsável por implementar o protocolo HTTP (por exemplo, com Axios), essa separação permite que `HttpService` fique isolado da implementação do HTTP, bem como possibilita o uso de *mocks* para facilitar os testes de unidade.

> `ErrorHandlerType` é dedicado ao tratamento de erros de nível global (para todo o serviço).

Sendo assim, para instanciar o serviço sempre será preciso fornecer um `IHttpAdapter` no construtor. O app já traz algumas implementações padrões da `IHttpAdapter`, como o `AxiosHttpAdapter` e `MockHttpAdapter`.

> Consulte a documentação oficial do `Axios` para conhecer mais sobre essa ferramenta: https://axios-http.com

Continuando o exemplo anterior:

```ts
  import Axios from 'axios';
  import { AxiosHttpAdapter } from '~/http/adapters/AxiosHttpAdapter';
  import { HttpService } from '~/http/HttpService';

  export class MyHttpService extends HttpService {
    // ...
  }

  const myHttpServiceInstance = new MyHttpService(new AxiosHttpAdapter(
    // cria a instância do axios
    Axios.create(),
    {
      baseURL: Environment.apiBaseUrl,
      // define interceptors caso necessário
      headerInterceptors: [/* ... */],
    }
  ));

  // exporta a instância padrão do serviço que será utilizado no componente
  export default myHttpServiceInstance;
```

Conforme exemplo, o `AxiosHttpAdapter` recebe no construtor uma instância do `Axios`, que deve ser única para cada `HttpService`. 

Por fim, o `export default` do módulo deve expor a instância do `MyHttpService` padrão, a qual será **injetado** nos componentes quando necessário.

## Tratamento de erros

Por padrão, o `AxiosHttpAdapter` faz o tratamento automático de três tipos de erros:

- `NETWORK`: Erros de conexão de rede, podendo ser falta de internet do dispositivo, ou indisponibilidade do servidor.
- `SERVER`: Erros inesperados retornados pelo servidor, sendo `status code` maior ou igual a `500`. 
- `UNKNOWN`: Erros não identificado pelo *adapter*.

Demais erros, são responsabilidade das implementações de `HttpService` realizar o tratamento. Por isso, o `HttpService` permite dois níveis de tratamento de erros, sendo um **Global** e os **Locais**.

A diferença é que o `ErrorHandlerType` **Global** é aplicado a todas as chamadas de API implementadas dentro do `HttpService`, enquanto o `ErrorHandlerType` **Locais** será aplicado somente a uma determinada rota (endpoint).

Adicionalmente, o `HttpService` também recebe via *generics* um `ErrorIdentifierType`, responsável por definir quais os tipos de erros os `ErrorHandlerType` **Global** e **Local** podem tratar.

### Criando o `ErrorIdentifierType`

`ErrorIdentifierType` é o tipo que define quais os erros que o serviço pode retornar, considerando os contextos **Global** e **Locais**.

O primeiro passo é informar via *generics* ao `HttpService`:

```ts
  type MyHttpServiceErrorsType = ErrorIdentifierType<'PERMISSION_NOT_FOUND' | 'RECORD_NOT_FOUND' | 'UNAUTHORIZED'>;

  export class MyHttpService extends HttpService<MyHttpServiceErrorsType> {

    // ...
```

No código acima, foi criado um `type` chamado `MyHttpServiceErrorsType` que unifica os tipos de erros padrões já existentes no `ErrorIdentifierType`, adicionando mais opções. 

Deste modo, os tipos de erros aceitos pelo `MyHttpService` será:

- `NETWORK` -> ErrorIdentifierType (gerado pelo `AxiosHttpAdapter`)
- `SERVER` -> ErrorIdentifierType (gerado pelo `AxiosHttpAdapter`)
- `UNKNOWN` -> ErrorIdentifierType (gerado pelo `AxiosHttpAdapter`)
- `PERMISSION_NOT_FOUND` -> MyHttpServiceErrorsType (tratado no `MyHttpService`)
- `RECORD_NOT_FOUND` -> MyHttpServiceErrorsType (tratado no `MyHttpService`)
- `UNAUTHORIZED` -> MyHttpServiceErrorsType (tratado no `MyHttpService`)

### Implementando o `ErrorHandlerType` **Locais**

Crie uma função que implemente o tipo `ErrorHandlerType`, e no momento de realizar a requisição, informe este `ErrorHandlerType` como argumento para as funções `get/post/put/delete/patch`:

```ts
  login(username: string, password: string) {
    const localErrorHandler: ErrorHandlerType<MyHttpServiceErrorsType, ResponseErrorDataType> = response => {
      if (response.status === 401) {
        return 'UNAUTHORIZED';
      }
      return 'UNKNOWN';
    };

    const body = {
      username,
      password,
    };

    return this.post<ResponseSuccessDataType, ResponseErrorDataType, RequestDataType>('/login', body, undefined, localErrorHandler);
  }
```

O `ErrorHandlerType` **Local** é o segundo na hierarquia de tratamento de erros, ou seja, sempre que o `IHttpAdapter` retornar um erro `UNKNOWN`, o **Local** será chamado passando o `IResponseError` resultante da requisição, esperando-se que um dos tipos de erros seja retornado.

### Implementando o `ErrorHandlerType` **Global**

Crie uma função que implemente o tipo `ErrorHandlerType`:

```ts
  const globalErrorHandler: ErrorHandlerType<MyHttpServiceErrorsType> = 
    response => {
      if (response.status === 404) {
        return 'RECORD_NOT_FOUND';
      }
      if (response.status === 403) {
        return 'PERMISSION_NOT_FOUND';
      }
      return 'UNKNOWN';
    };
```

Sobrescreva o construtor de `HttpService`, passando a função criada como argumento para o `super`:

```ts
  export class MyHttpService extends HttpService<MyHttpServiceErrorsType> {

    constructor(httpAdapter: IHttpAdapter) {
      super(httpAdapter, globalErrorHandler);
    }

    // ...
```

O `ErrorHandlerType` **Global** é o último na hierarquia de tratamento de erros, ou seja, sempre que o `ErrorHandlerType` **Local** retornar um erro `UNKNOWN`, o **Global** será chamado passando o `IResponseError` resultante da requisição, esperando-se que um dos tipos de erros seja retornado.

## Interceptando respostas

Em casos onde seja necessário interceptar um `response` para modificar seu conteúdo ou tipo, é possível utilizar o `ResponseInterceptor` **Local** e/ou **Global**.

Esse recurso pode ser utilizado para, por exemplo, em casos onde a API retorna um erro em uma resposta de sucesso com status `200`, e então no interceptador
podemos converter de forma forçada para uma resposta de erro.

### Implementando o `ResponseInterceptor` **Local**

Crie uma função que implemente o tipo `ResponseInterceptorType`, e no momento de realizar a requisição, informe este `ResponseInterceptorType` como argumento para as funções `get/post/put/delete/patch`:

```ts
  login(username: string, password: string) {
    const localResponseInterceptor: ResponseInterceptorType<ResponseSuccessDataType, ResponseErrorDataType, MyHttpServiceErrorsType> = 
      response => {
        return {
          error: 'ERROR_GENERATED_BY_LOCAL_INTERCEPTOR',
          data: response.data,
          headers: response.headers,
          status: response.status,
          url: response.url,
        };
      };

    const body = {
      username,
      password,
    };

    return this.post<ResponseSuccessDataType, ResponseErrorDataType, RequestDataType>('/login', body, undefined, localErrorHandler, localResponseInterceptor);
  }
```

### Implementando o `ResponseInterceptor` **Global**

Crie uma função que implemente o tipo `ResponseInterceptorType`:

```ts
  const globalResponseInterceptor: ResponseInterceptorType<any, any, MyHttpServiceErrorsType> = 
    response => {
      return {
        error: 'ERROR_GENERATED_BY_GLOBAL_INTERCEPTOR',
        data: response.data,
        headers: response.headers,
        status: response.status,
        url: response.url,
      };
    };
```

Sobrescreva o construtor de `HttpService`, passando a função criada como argumento para o `super`:

```ts
  export class MyHttpService extends HttpService<MyHttpServiceErrorsType> {

    constructor(httpAdapter: IHttpAdapter) {
      super(httpAdapter, globalErrorHandler, globalResponseInterceptor);
    }

    // ...
```

## Mockando serviços nos testes

Seja em teste de unidade ou de componente, sempre devemos utilizar *mocks* quando necessitamos de interação com os serviços HTTP.

Deste modo, garantimos que nossos testes trabalharão de forma independente do backend, além de evitarmos que durante a execução, os servidores de backend sejam inundados de requisições.

Para criar um *mock* de um serviço, basta instanciar o serviço desejado fornecendo no construtor uma instância de `MockHttpAdapter`:

```ts
describe('MyHttpService', () => {
  it('should do something', async () => {
    const productsResponseData = {
      metadata: {
        page: 0,
        total: 1,
      }
      results: [
        {
          id: 1,
          description: 'Foo bar',
        },
        {
          id: 2,
          description: 'Hello world',
        }
      ]
    };

    const productsResponseMock = {
      data: productsResponseData,
      headers: { },
      status: 200,
      url: '/api/products/list',
    }

    const mockAdapter = new MockHttpAdapter({ 
      '/api/products/list': productsResponseMock
    });

    const mockService = new MyHttpService(mockAdapter);

    const response = await mockService.getProducts();

    expect(response.data.results.length).toBe(2);
  });
});
```

No exemplo acima, criamos um *mock* para o *endpoint* `/api/products/list`, simulando um determinado retorno do backend com `status`, `data` e etc.

Também podemos simular situações com erro, para que possamos testar *error handlers* por exemplo.

```ts
describe('MyHttpService', () => {
  it('should do something', async () => {

    const productsResponseMock = {
      data: { },
      headers: { },
      status: 401,
      url: '/api/products/list',
      error: 'UNKNOWN',
    }

    const mockAdapter = new MockHttpAdapter({ 
      '/api/products/list': productsResponseMock
    });

    const mockService = new MyHttpService(mockAdapter);

    const response = await mockService.getProducts();

    expect(response.error).toBe('UNAUTHORIZED');
  });
});
```

Perceba que neste exemplo o *mock* simula o retorno do backend com `status` 401 e `error` "UNKNOWN". 

Isso é proposital, pois conforme vimos anteriormente sobre os tratamentos de erro, quando o *adapter* retorna "UNKNOWN", os *error handlers* são chamados.

### Conhecendo o `withPropsInjection`

O `withPropsInjection` é um High-Order Component (HOC) que facilita a injeção automática de dependências em componentes. Apesar de poder ser usado em qualquer componente, ele foi criado especialmente para injetar HTTP Services em Telas da aplicação, possibilitando a passagem de mocks durante a execução dos testes de unidade.

### Utilizando o `withPropsInjection` em uma Tela

Componente original:

```tsx
import React from 'react';
import { MyHttpService } from '~/http/MyHttpService';

type MyScreenProps = {
  myHttpService: MyHttpService;
};

const MyScreen = ({ myHttpService }: MyScreenProps) => {
  // Uso do myHttpService
  return <Text>My Component</Text>;
};

export default MyScreen;
```

Uma vez que a tela depende de um serviço HTTP, é possível injetar a instância padrão do serviço utilizando o `withPropsInjection`:

```tsx
import React from 'react';
import myHttpServiceInstance, { MyHttpService } from '~/http/MyHttpService';

type MyScreenProps = {
  myHttpService: MyHttpService;
};

const MyScreen = ({ myHttpService }: MyScreenProps) => {
  // Uso do myHttpService
  return <Text>My Component</Text>;
};

export default withPropsInjection(MyScreen, {
  myHttpService: myHttpServiceInstance,
});
```

Deste modo, quando a tela for renderizada pelo `react-navigation`, o `withPropsInjection` injetará automaticamente a instância padrão do serviço HTTP para a tela.

### Substituindo as props do `withPropsInjection` em um teste de unidade

Para substituir a instância padrão do serviço HTTP por um *mock* durante um teste de unidade, basta passar a instância do *mock* como propriedade para o componente da tela:

```tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import MyScreen from './MyScreen';
import { MyHttpService } from '~/http/MyHttpService';

describe('MyScreen', () => {
  it('should do something', async () => {
    const myHttpServiceMock = new MyHttpService(new MockHttpAdapter({
      // mocks
    }));

    const result = render(
      <MyScreen myHttpService={myHttpServiceMock} />
    );

    // Teste
  });
});
```
