# React Instruction

This document provides guidelines for creating a React component using functional React, FontAwesome Pro Light for icons, and react-query for API calls. It should use react-bootstrap and use bootstrap utility clases. The structure of the component should be as follows: contexts, state variables, queries, useEffects, functions, early returns, and lastly the return statement. Contexts and API functions should be in different files. API should be setup using react-query, axios and utilize hooks for them. Everything should be typed using TypeScript. Avoid using `any` type. Only suggest using context and api when asked for. Remember to add accessibility attributes to the JSX elements.

## Example Component

### Context File (MyContext.tsx)

```tsx
import React, { createContext, useContext, ReactNode } from 'react';

interface MyContextType {
  state: Record<string, unknown>;
}

const MyContext = createContext<MyContextType | undefined>(undefined);

export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within a MyContextProvider');
  }
  return context;
};

interface MyContextProviderProps {
  children: ReactNode;
}

export const MyContextProvider: React.FC<MyContextProviderProps> = ({ children }) => {
  const state = {}; // Your state logic here

  return <MyContext.Provider value={{ state }}>{children}</MyContext.Provider>;
};
```

### API File (api.ts)

```ts
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const fetchUser = async (userId: number) => {
  const response = await axios.get(`/api/users/${userId}`);
  return response.data;
};

const userQueryKey: QueryKey = ['user'];
const useUser = (userId: number) => {
  return useQuery({ queryKey: ['user', userId], queryFn: () => fetchUser(userId) });
};
```

### Main Component File (MyComponent.tsx)

```tsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee } from '@fortawesome/pro-light-svg-icons';
import { MyContextProvider } from './MyContext';
import { useSubmitData } from './api';

const MyComponentWrapped: React.FC = () => {
  const [state, setState] = useState<Record<string, unknown> | null>(null);
  const { data, isLoading, error } = useSubmitData();

  useEffect(() => {
    if (data) {
      setState(data);
    }
  }, [data]);

  const handleClick = () => {
    console.log('Button clicked');
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className='d-flex flex-column align-items-center'>
      <h1>My Component</h1>
      <Button onClick={handleClick} variant='primary'>
        <FontAwesomeIcon icon={faCoffee} aria-hidden='true' /> Click Me
      </Button>
    </div>
  );
};

const MyComponent: React.FC = () => {
  return (
    <MyContextProvider>
      <MyComponentWrapped />
    </MyContextProvider>
  );
};

export default MyComponent;
```

# Typescript Instruction (not cypress typescript)

- **Interfaces**: Always create well-structured interfaces for objects.
- **Enums**: Use enums when it is a good choice to represent a set of related constants.

## API Integration

- **Axios**: Use `axios` for making HTTP requests.
- **React Query**: Structure API calls in a way that they can be easily handled by `react-query`.

## Example Code

### Interface Example

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

enum UserRole {
  Admin = 'ADMIN',
  User = 'USER',
  Guest = 'GUEST'
}
```

### API Example (api.ts)

```typescript
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const fetchUser = async (userId: number) => {
  const response = await axios.get(`/api/users/${userId}`);
  return response.data;
};

const useUser = (userId: number) => {
  return useQuery({ queryKey: ['user', userId], queryFn: () => fetchUser(userId) });
};
```

# Cypress typescript Instruction

In each Cypress test file, follow these guidelines:

1. Before Hook: Sign the user in.

2. Setup Phase:

- Create a testData object containing all parameters to be verified and typed into inputs.
- Setup mock data with the testData object using cy.setupMocks.
- Create intercepts for any API calls that need to be waited for.

3. Act Phase:

- Visit the correct URL.
- Perform actions using elements identified by data-cy attributes.

4. Assert Phase:

- Verify that everything went correctly by asserting elements with data-cy attributes.
- If nothing is visualized in the GUI, check that something has disappeared or call the verify method of the mock using cy.verifyMocks.

## Example Code

```typescript
describe('Example Test', () => {
  before(() => {
    // Sign the user in
    cy.login(); // Assuming you have a custom command for login
  });

  it('should perform actions and verify results', () => {
    // Setup Phase
    const testData = {
      id: 'f7a5c0af-ed30-56dd-a46c-bf9c4b6c7b6e',
      name: 'Test Name',
      email: 'test@example.com'
    };
    cy.setupMocks('example-test', testData);

    // Intercepts
    cy.intercept('GET', '/api/users/*').as('getUser');

    // Act Phase
    cy.visit('/test');
    cy.findByTestAttribute('input-name').type(testData.name);
    cy.findByTestAttribute('input-email').type(testData.email);
    cy.findByTestAttribute('submit-button').click();

    // Wait for API call
    cy.wait('@getUser');

    // Assert Phase
    cy.findByTestAttribute('name-display').should('contain', testData.name);
    cy.findByTestAttribute('email-display').should('contain', testData.email);
    cy.verifyMocks('example-test', testData);
  });
});
```

# Cs files inside WebTests folder

- When inside context files, create structured functions that take in multiple parameters to control what is being mocked.
- The input to the functions should have values set that should work for most situations.

## Context Files

Create functions that mock API calls and services.

- Ensure each function has default values for parameters.
- Separate Setup and Verify functions.

### Example

```csharp
public void SetupGetStuff(List<Stuff> stuffs = null)
{
  stuffs ??= new List<Stuff> { new Stuff { Id = Guid.NewGuid() } };
  MyStuffService.Setup(s => s.GetStuff())
      .Returns(stuffs);
}

public void VerifyGetStuff(Times times = null)
{
  times ??= Times.Once();
  MyStuffService.Verify(s => s.GetStuff(), times);
}
```

## MockDataSetup Files

- Set the Name property to the same as the file name but in kebab-case and without MockDataSetup.
- Utilize the functions in the context files.
- Include both Setup and Verify in most cases.
- Use the same test data that the corresponding test data has in cy.ts file.

### Example

```csharp
public class DefaultMockDataSetup : IMockDataSetup
{
    private readonly MockContext _mockContext;

    public DefaultMockDataSetup(MockContext mockContext)
    {
        _mockContext = mockContext;
    }

    public string Name => "default";

    public void Setup(dynamic _)
    {
        _mockContext.SetupUser(user => { });
        _mockContext.SetupGetStuff();
    }

    public void Verify()
    {
        _mockContext.VerifyGetStuff();
    }
}
```

# SCSS/CSS/LESS Instruction

1. Utilize Bootstrap Standard Variables

- Use Bootstrap's predefined variables for colors, spacing, typography, etc.
- Example: $primary, $secondary, $spacer, $font-size-base, etc.

2. Avoid Nesting More Than 3 Layers

- Keep nesting levels to a maximum of 3 to maintain readability and simplicity.

- Example max nesting SCSS

```scss
.parent {
  .child {
    .grandchild {
      // No further nesting here
    }
  }
}
```

# Commands

Always check spec.md and build-plan.md if they exists in working set for further instructions.

## -plan

When the instruction starts with "-plan", you should not make any code changes and only think of what should be done. Provide a detailed plan or steps to achieve the task.

## -save

When the instruction starts with "-save", you should save the plan in a build-plan.md file in .github folder. This includes creating the file if it does not exist.

## -act

When the instruction starts with "-act", you should perform the specific code update as described in the instruction.

## -language

When the instruction starts with "-language", you should use langugage-instructions.md file as reference if you got access to it. The task is to update all language files to match what is said in the instructions but translated to the correct language.

## -refactor

When the instruction starts with "-refactor", you should refactor the code according to the instructions and if only refactor you should try to refactor as much as possible to reduce code complexity. Create new files, break out functions etc. Make sure no functionality is lost.
