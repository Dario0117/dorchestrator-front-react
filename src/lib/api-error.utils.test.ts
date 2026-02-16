import { setFormErrorsFromResponse } from '@lib/api-error.utils';

describe('setFormErrorsFromResponse', () => {
  it('should set default fallback error when responseErrors is null', () => {
    const mockForm = { setErrorMap: vi.fn() };

    setFormErrorsFromResponse({ responseErrors: null }, mockForm);

    expect(mockForm.setErrorMap).toHaveBeenCalledWith({
      onSubmit: {
        form: 'Something went wrong, please try again later.',
        fields: {},
      },
    });
  });

  it('should set default fallback error when responseErrors is undefined', () => {
    const mockForm = { setErrorMap: vi.fn() };

    setFormErrorsFromResponse({ responseErrors: undefined }, mockForm);

    expect(mockForm.setErrorMap).toHaveBeenCalledWith({
      onSubmit: {
        form: 'Something went wrong, please try again later.',
        fields: {},
      },
    });
  });

  it('should set field errors from responseErrors', () => {
    const mockForm = { setErrorMap: vi.fn() };

    setFormErrorsFromResponse(
      {
        responseErrors: {
          email: ['Email is required', 'Email is invalid'],
          password: ['Password is too short'],
        },
      },
      mockForm,
    );

    expect(mockForm.setErrorMap).toHaveBeenCalledWith({
      onSubmit: {
        form: 'Please fix the errors below',
        fields: {
          email: ['Email is required', 'Email is invalid'],
          password: ['Password is too short'],
        },
      },
    });
  });

  it('should extract nonFieldErrors separately', () => {
    const mockForm = { setErrorMap: vi.fn() };

    setFormErrorsFromResponse(
      {
        responseErrors: {
          nonFieldErrors: ['Invalid credentials'],
        },
      },
      mockForm,
    );

    expect(mockForm.setErrorMap).toHaveBeenCalledWith({
      onSubmit: {
        form: ['Invalid credentials'],
        fields: {},
      },
    });
  });

  it('should use nonFieldErrors as form error when no field errors exist', () => {
    const mockForm = { setErrorMap: vi.fn() };

    setFormErrorsFromResponse(
      {
        responseErrors: {
          nonFieldErrors: ['Server error occurred'],
        },
      },
      mockForm,
    );

    expect(mockForm.setErrorMap).toHaveBeenCalledWith({
      onSubmit: {
        form: ['Server error occurred'],
        fields: {},
      },
    });
  });

  it('should use default form error when field errors exist but no nonFieldErrors', () => {
    const mockForm = { setErrorMap: vi.fn() };

    setFormErrorsFromResponse(
      {
        responseErrors: {
          email: ['Required'],
        },
      },
      mockForm,
    );

    expect(mockForm.setErrorMap).toHaveBeenCalledWith({
      onSubmit: {
        form: 'Please fix the errors below',
        fields: {
          email: ['Required'],
        },
      },
    });
  });

  it('should skip non-array values in responseErrors', () => {
    const mockForm = { setErrorMap: vi.fn() };

    setFormErrorsFromResponse(
      {
        responseErrors: {
          email: 'not an array' as unknown as Record<string, unknown>,
          password: ['Valid error'],
        },
      },
      mockForm,
    );

    expect(mockForm.setErrorMap).toHaveBeenCalledWith({
      onSubmit: {
        form: 'Please fix the errors below',
        fields: {
          password: ['Valid error'],
        },
      },
    });
  });

  it('should skip empty arrays in responseErrors', () => {
    const mockForm = { setErrorMap: vi.fn() };

    setFormErrorsFromResponse(
      {
        responseErrors: {
          email: [] as unknown as Record<string, unknown>,
        },
      },
      mockForm,
    );

    expect(mockForm.setErrorMap).toHaveBeenCalledWith({
      onSubmit: {
        form: 'Something went wrong, please try again later.',
        fields: {},
      },
    });
  });

  it('should use default fallback when no field errors and no nonFieldErrors', () => {
    const mockForm = { setErrorMap: vi.fn() };

    setFormErrorsFromResponse(
      {
        responseErrors: {},
      },
      mockForm,
    );

    expect(mockForm.setErrorMap).toHaveBeenCalledWith({
      onSubmit: {
        form: 'Something went wrong, please try again later.',
        fields: {},
      },
    });
  });

  it('should handle both field errors and nonFieldErrors', () => {
    const mockForm = { setErrorMap: vi.fn() };

    setFormErrorsFromResponse(
      {
        responseErrors: {
          nonFieldErrors: ['General error'],
          email: ['Email error'],
        },
      },
      mockForm,
    );

    // When there are field errors, the form message is the default form error, not nonFieldErrors
    expect(mockForm.setErrorMap).toHaveBeenCalledWith({
      onSubmit: {
        form: 'Please fix the errors below',
        fields: {
          email: ['Email error'],
        },
      },
    });
  });
});
