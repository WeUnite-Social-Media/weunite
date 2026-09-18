import 'package:flutter/material.dart';

import '../../domain/entities/profile.dart';

/// The "Sobre" tab, mirroring the web `AboutProfile`: bio, then the athlete
/// characteristics (age, position, dominant foot, height, weight) or the
/// company's CNPJ, then the skills.
///
/// Values the API does not have show as "N/A", exactly like the web does —
/// nothing here is invented.
class AboutProfile extends StatelessWidget {
  const AboutProfile({required this.profile, super.key});

  final Profile profile;

  @override
  Widget build(BuildContext context) {
    final bio = profile.bio?.trim();
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            (bio == null || bio.isEmpty) ? 'Nenhuma descricao informada.' : bio,
          ),
          if (profile.isAthlete) ...[
            const SizedBox(height: 24),
            _SectionTitle('Caracteristicas'),
            const SizedBox(height: 8),
            _Item(label: 'Idade', value: _age(profile)),
            _Item(label: 'Posicao', value: profile.position),
            _Item(label: 'Pe dominante', value: profile.footDomain),
            _Item(
              label: 'Altura',
              value: profile.height == null ? null : '${profile.height}m',
            ),
            _Item(
              label: 'Peso',
              value: profile.weight == null ? null : '${profile.weight}kg',
            ),
          ],
          if (profile.skills.isNotEmpty) ...[
            const SizedBox(height: 24),
            _SectionTitle('Habilidades'),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: profile.skills
                  .map((skill) => Chip(label: Text(skill)))
                  .toList(),
            ),
          ],
        ],
      ),
    );
  }

  String? _age(Profile profile) {
    final age = profile.age;
    return age == null ? null : '$age anos';
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.title);

  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(title, style: Theme.of(context).textTheme.titleMedium);
  }
}

class _Item extends StatelessWidget {
  const _Item({required this.label, required this.value});

  final String label;
  final String? value;

  @override
  Widget build(BuildContext context) {
    final text = (value == null || value!.trim().isEmpty) ? 'N/A' : value!;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 140,
            child: Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
          Expanded(
            child: Text(
              text,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}
