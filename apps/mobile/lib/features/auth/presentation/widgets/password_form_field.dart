import 'package:flutter/material.dart';

/// A password field with the web's eye toggle (`Eye` / `EyeOff` in every
/// password input of `Login`, `SignUp`, `SignUpCompany` and `ResetPassword`).
///
/// Every sensitive field in the app uses this widget, so the behaviour is the
/// same everywhere: hidden to begin with, one tap reveals, another hides. The
/// toggle only flips `obscureText`, so the typed value is untouched and the
/// field keeps its focus and cursor.
class PasswordFormField extends StatefulWidget {
  const PasswordFormField({
    required this.controller,
    required this.label,
    this.validator,
    this.onChanged,
    this.textInputAction = TextInputAction.next,
    this.onFieldSubmitted,
    this.enabled = true,
    super.key,
  });

  final TextEditingController controller;
  final String label;
  final String? Function(String?)? validator;
  final ValueChanged<String>? onChanged;
  final TextInputAction textInputAction;
  final ValueChanged<String>? onFieldSubmitted;
  final bool enabled;

  @override
  State<PasswordFormField> createState() => _PasswordFormFieldState();
}

class _PasswordFormFieldState extends State<PasswordFormField> {
  bool _isVisible = false;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: widget.controller,
      obscureText: !_isVisible,
      enabled: widget.enabled,
      autocorrect: false,
      enableSuggestions: false,
      textInputAction: widget.textInputAction,
      onChanged: widget.onChanged,
      onFieldSubmitted: widget.onFieldSubmitted,
      validator: widget.validator,
      decoration: InputDecoration(
        labelText: widget.label,
        prefixIcon: const Icon(Icons.key_outlined),
        suffixIcon: IconButton(
          onPressed: () => setState(() => _isVisible = !_isVisible),
          icon: Icon(
            _isVisible
                ? Icons.visibility_off_outlined
                : Icons.visibility_outlined,
          ),
          tooltip: _isVisible ? 'Esconder senha' : 'Mostrar senha',
        ),
      ),
    );
  }
}
