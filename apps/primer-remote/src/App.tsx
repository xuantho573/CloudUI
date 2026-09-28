import '@primer/primitives/dist/css/functional/themes/light.css'
import { BaseStyles } from '@primer/react'
import { ThemeProvider } from '@primer/react/next'

import "./App.css";
import DropdownMenu from './components/DropdownMenu';

export default function App() {

  return (
    <ThemeProvider>
      <BaseStyles>
        <DropdownMenu
          triggerLabel='Open menu'
          items={['First', 'Second', 'Third']}
          onItemSelect={(item) => console.log(`Select ${item}`)}
        />
      </BaseStyles>
    </ThemeProvider>
  );
}
