import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/profile.dart';
import '../../domain/repositories/profile_repository.dart';
import '../cubit/edit_profile_cubit.dart';

/// Same limit the API enforces for uploads (10 MB).
const kMaxProfileImageBytes = 10 * 1024 * 1024;

/// Form for the signed-in user's profile: name, username, bio, privacy,
/// athlete attributes, skills, avatar and banner.
class EditProfileScreen extends StatelessWidget {
  const EditProfileScreen({required this.profile, super.key});

  final Profile profile;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => EditProfileCubit(
        profile: profile,
        repository: context.read<ProfileRepository>(),
      )..loadSkills(),
      child: _EditProfileView(profile: profile),
    );
  }
}

class _EditProfileView extends StatefulWidget {
  const _EditProfileView({required this.profile});

  final Profile profile;

  @override
  State<_EditProfileView> createState() => _EditProfileViewState();
}

class _EditProfileViewState extends State<_EditProfileView> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name;
  late final TextEditingController _username;
  late final TextEditingController _bio;
  late final TextEditingController _height;
  late final TextEditingController _weight;
  late final TextEditingController _position;
  late final TextEditingController _footDomain;
  late bool _isPrivate;
  DateTime? _birthDate;

  bool get _isAthlete => !widget.profile.isCompany;

  @override
  void initState() {
    super.initState();
    final profile = widget.profile;
    _name = TextEditingController(text: profile.name);
    _username = TextEditingController(text: profile.username);
    _bio = TextEditingController(text: profile.bio ?? '');
    _height = TextEditingController(text: _number(profile.height));
    _weight = TextEditingController(text: _number(profile.weight));
    _position = TextEditingController(text: profile.position ?? '');
    _footDomain = TextEditingController(text: profile.footDomain ?? '');
    _isPrivate = profile.isPrivate;
    _birthDate = profile.birthDate;
  }

  String _number(double? value) {
    if (value == null) {
      return '';
    }
    return value == value.roundToDouble()
        ? value.toStringAsFixed(0)
        : value.toString();
  }

  @override
  void dispose() {
    _name.dispose();
    _username.dispose();
    _bio.dispose();
    _height.dispose();
    _weight.dispose();
    _position.dispose();
    _footDomain.dispose();
    super.dispose();
  }

  Future<void> _pick(BuildContext context, {required bool isBanner}) async {
    final cubit = context.read<EditProfileCubit>();
    final XFile? file;
    try {
      file = await ImagePicker().pickImage(
        source: ImageSource.gallery,
        maxWidth: 2048,
        maxHeight: 2048,
        imageQuality: 85,
      );
    } on PlatformException {
      cubit.reportError('Nao foi possivel abrir a galeria.');
      return;
    }
    if (file == null) {
      return;
    }
    if (await file.length() > kMaxProfileImageBytes) {
      cubit.reportError('A imagem deve ter no maximo 10 MB.');
      return;
    }
    if (isBanner) {
      cubit.pickBannerImage(file.path);
    } else {
      cubit.pickProfileImage(file.path);
    }
  }

  Future<void> _pickBirthDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _birthDate ?? DateTime(now.year - 18),
      firstDate: DateTime(now.year - 90),
      lastDate: now,
    );
    if (picked != null) {
      setState(() => _birthDate = picked);
    }
  }

  void _save(BuildContext context) {
    if (!(_formKey.currentState?.validate() ?? false)) {
      return;
    }
    context.read<EditProfileCubit>().save(
          name: _name.text.trim(),
          username: _username.text.trim(),
          bio: _bio.text.trim(),
          isPrivate: _isPrivate,
          height: double.tryParse(_height.text.trim().replaceAll(',', '.')),
          weight: double.tryParse(_weight.text.trim().replaceAll(',', '.')),
          position: _position.text.trim(),
          footDomain: _footDomain.text.trim(),
          birthDate: _birthDate,
          isAthlete: _isAthlete,
        );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<EditProfileCubit, EditProfileState>(
      listenWhen: (previous, current) =>
          previous.savedProfile != current.savedProfile ||
          (current.errorMessage != null &&
              previous.errorMessage != current.errorMessage),
      listener: (context, state) {
        if (state.savedProfile != null) {
          Navigator.of(context).pop(state.savedProfile);
          return;
        }
        if (state.errorMessage != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.errorMessage!)),
          );
        }
      },
      builder: (context, state) {
        return Scaffold(
          appBar: AppBar(
            title: const Text('Editar perfil'),
            actions: [
              TextButton(
                onPressed: state.isSaving ? null : () => _save(context),
                child: Text(state.isSaving ? 'Salvando...' : 'Salvar'),
              ),
            ],
          ),
          body: Form(
            key: _formKey,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _BannerPicker(
                  profile: widget.profile,
                  state: state,
                  onPick: () => _pick(context, isBanner: true),
                  onRemove: context.read<EditProfileCubit>().removeBanner,
                ),
                const SizedBox(height: 16),
                _AvatarPicker(
                  profile: widget.profile,
                  state: state,
                  onPick: () => _pick(context, isBanner: false),
                ),
                const SizedBox(height: 24),
                TextFormField(
                  controller: _name,
                  decoration: const InputDecoration(labelText: 'Nome'),
                  validator: (value) => (value ?? '').trim().length < 5
                      ? 'Informe ao menos 5 caracteres.'
                      : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _username,
                  decoration: const InputDecoration(labelText: 'Usuario'),
                  validator: (value) => (value ?? '').trim().length < 5
                      ? 'Informe ao menos 5 caracteres.'
                      : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _bio,
                  minLines: 3,
                  maxLines: 5,
                  maxLength: 500,
                  decoration: const InputDecoration(labelText: 'Bio'),
                ),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  value: _isPrivate,
                  onChanged: (value) => setState(() => _isPrivate = value),
                  title: const Text('Perfil privado'),
                ),
                if (_isAthlete) ...[
                  const Divider(height: 32),
                  Text(
                    'Caracteristicas',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _height,
                          keyboardType: TextInputType.number,
                          decoration:
                              const InputDecoration(labelText: 'Altura (cm)'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextFormField(
                          controller: _weight,
                          keyboardType: TextInputType.number,
                          decoration:
                              const InputDecoration(labelText: 'Peso (kg)'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _position,
                    decoration: const InputDecoration(labelText: 'Posicao'),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _footDomain,
                    decoration:
                        const InputDecoration(labelText: 'Perna dominante'),
                  ),
                  const SizedBox(height: 12),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Data de nascimento'),
                    subtitle: Text(
                      _birthDate == null
                          ? 'Nao informada'
                          : DateFormat('dd/MM/yyyy').format(_birthDate!),
                    ),
                    trailing: const Icon(Icons.calendar_today_outlined),
                    onTap: _pickBirthDate,
                  ),
                  const Divider(height: 32),
                  Text(
                    'Habilidades',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  _SkillSelector(state: state),
                ],
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: state.isSaving ? null : () => _save(context),
                  child: Text(state.isSaving ? 'Salvando...' : 'Salvar'),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _BannerPicker extends StatelessWidget {
  const _BannerPicker({
    required this.profile,
    required this.state,
    required this.onPick,
    required this.onRemove,
  });

  final Profile profile;
  final EditProfileState state;
  final VoidCallback onPick;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    final picked = state.bannerImagePath;
    final showCurrent =
        !state.removeBanner && picked == null && profile.bannerImg != null;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: SizedBox(
            height: 120,
            width: double.infinity,
            child: picked != null
                ? Image.file(File(picked), fit: BoxFit.cover)
                : showCurrent
                    ? Image.network(profile.bannerImg!, fit: BoxFit.cover)
                    : Container(color: AppColors.muted),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            OutlinedButton.icon(
              onPressed: onPick,
              icon: const Icon(Icons.image_outlined),
              label: const Text('Trocar capa'),
            ),
            const SizedBox(width: 8),
            if (picked != null || showCurrent)
              TextButton.icon(
                onPressed: onRemove,
                icon: const Icon(Icons.delete_outline),
                label: const Text('Remover capa'),
              ),
          ],
        ),
      ],
    );
  }
}

class _AvatarPicker extends StatelessWidget {
  const _AvatarPicker({
    required this.profile,
    required this.state,
    required this.onPick,
  });

  final Profile profile;
  final EditProfileState state;
  final VoidCallback onPick;

  @override
  Widget build(BuildContext context) {
    final picked = state.profileImagePath;
    return Row(
      children: [
        CircleAvatar(
          radius: 36,
          backgroundImage: picked != null
              ? FileImage(File(picked)) as ImageProvider<Object>
              : profile.profileImg != null
                  ? NetworkImage(profile.profileImg!)
                  : null,
          child: picked == null && profile.profileImg == null
              ? Text(profile.name.isEmpty ? '?' : profile.name[0].toUpperCase())
              : null,
        ),
        const SizedBox(width: 16),
        OutlinedButton.icon(
          onPressed: onPick,
          icon: const Icon(Icons.photo_camera_outlined),
          label: const Text('Trocar foto'),
        ),
      ],
    );
  }
}

class _SkillSelector extends StatelessWidget {
  const _SkillSelector({required this.state});

  final EditProfileState state;

  @override
  Widget build(BuildContext context) {
    final options = {...state.availableSkills, ...state.skills}.toList()
      ..sort();
    if (options.isEmpty) {
      return const Text('Nenhuma habilidade cadastrada no sistema.');
    }
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        for (final skill in options)
          FilterChip(
            label: Text(skill),
            selected: state.skills.contains(skill),
            onSelected: (_) =>
                context.read<EditProfileCubit>().toggleSkill(skill),
          ),
      ],
    );
  }
}
