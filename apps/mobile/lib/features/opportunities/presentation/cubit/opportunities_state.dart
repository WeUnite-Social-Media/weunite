part of 'opportunities_cubit.dart';

class OpportunitiesState extends Equatable {
  const OpportunitiesState({
    this.opportunities = const [],
    this.selectedSkill,
    this.isLoading = false,
    this.errorMessage,
  });

  final List<Opportunity> opportunities;
  final String? selectedSkill;
  final bool isLoading;
  final String? errorMessage;

  OpportunitiesState copyWith({
    List<Opportunity>? opportunities,
    String? selectedSkill,
    bool? isLoading,
    String? errorMessage,
  }) {
    return OpportunitiesState(
      opportunities: opportunities ?? this.opportunities,
      selectedSkill: selectedSkill ?? this.selectedSkill,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props =>
      [opportunities, selectedSkill, isLoading, errorMessage];
}
