import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import '../src/styles.css';
import './docs-theme.css';
import './preview-root.css';

// Render every story inside the package's style scope, the same way a consumer
// must. Without it the component-global classes — which are scoped exactly like
// the reset — would not apply here, and Storybook would be showing something the
// package cannot actually produce. Set on body rather than through a decorator
// so no extra element joins the story's layout.
if (typeof document !== 'undefined') {
  document.body.classList.add('tablewright');
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: { disable: true },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],
  tags: ['autodocs'],
};

export default preview;
