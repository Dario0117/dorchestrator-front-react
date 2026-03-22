import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ds/atoms/tooltip';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('TooltipProvider', () => {
  it('renders children', () => {
    render(
      <TooltipProvider>
        <span>child</span>
      </TooltipProvider>,
    );

    expect(screen.getByText('child')).toBeInTheDocument();
  });
});

describe('Tooltip', () => {
  it('renders trigger and shows content on hover', async () => {
    const user = userEvent.setup();

    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    expect(screen.getByText('Hover me')).toBeInTheDocument();

    await user.hover(screen.getByText('Hover me'));

    expect(await screen.findByText('Tooltip text')).toBeInTheDocument();
  });
});

describe('TooltipContent', () => {
  it('passes through side and align props', async () => {
    const user = userEvent.setup();

    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent
            side="bottom"
            sideOffset={8}
            align="start"
            alignOffset={4}
          >
            Content
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    await user.hover(screen.getByText('Trigger'));

    expect(await screen.findByText('Content')).toBeInTheDocument();
  });
});
