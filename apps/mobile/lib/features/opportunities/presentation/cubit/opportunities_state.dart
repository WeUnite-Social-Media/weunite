part of 'opportunities_cubit.dart';

class OpportunitiesState extends Equatable {
  const OpportunitiesState({
    this.opportunities = const [],
    this.selectedSkill,
    this.selectedOpportunity,
    this.isLoading = false,
    this.isDetailLoading = false,
    this.isSubmitting = false,
    this.errorMessage,
    this.successMessage,
  });

  final List<Opportunity> opportunities;
  final String? selectedSkill;
  final Opportunity? selectedOpportunity;
  final bool isLoading;
  final bool isDetailLoading;
  final bool isSubmitting;
  final String? errorMessage;
  final String? successMessage;

  OpportunitiesState copyWith({
    List<Opportunity>? opportunities,
    String? selectedSkill,
    Opportunity? selectedOpportunity,
    bool? isLoading,
    bool? isDetailLoading,
    bool? isSubmitting,
    String? errorMessage,
    String? successMessage,
  }) {
    return OpportunitiesState(
      opportunities: opportunities ?? this.opportunities,
      selectedSkill: selectedSkill ?? this.selectedSkill,
      selectedOpportunity: selectedOpportunity ?? this.selectedOpportunity,
      isLoading: isLoading ?? this.isLoading,
      isDetailLoading: isDetailLoading ?? this.isDetailLoading,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      errorMessage: errorMessage,
      successMessage: successMessage,
    );
  }

  @override
  List<Object?> get props => [
        opportunities,
        selectedSkill,
        selectedOpportunity,
        isLoading,
        isDetailLoading,
        isSubmitting,
        errorMessage,
        successMessage,
      ];
}
