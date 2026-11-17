import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FormTextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
};

export function FormTextField({
  label,
  error,
  required,
  hint,
  onBlur,
  onFocus,
  ...props
}: FormTextFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <ThemedText type="smallBold">
        {label}
        {required ? <ThemedText style={{ color: theme.danger }}> *</ThemedText> : null}
      </ThemedText>
      <TextInput
        {...props}
        placeholderTextColor={theme.textSecondary}
        selectionColor={theme.primary}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.input,
            borderColor: error ? theme.danger : focused ? theme.primary : theme.border,
          },
          props.multiline && styles.multiline,
          props.style,
        ]}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
      />
      {error ? (
        <ThemedText type="small" style={{ color: theme.danger }}>
          {error}
        </ThemedText>
      ) : hint ? (
        <ThemedText type="small" themeColor="textSecondary">
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.two,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  multiline: {
    minHeight: 108,
    textAlignVertical: 'top',
  },
});
