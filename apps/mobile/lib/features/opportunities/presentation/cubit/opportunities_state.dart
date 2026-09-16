part of 'opportunities_cubit.dart';

class OpportunitiesState extends Equatable {
  const OpportunitiesState({
    this.opportunities = const [],
    this.selectedSkill,
    this.isLoading = false,
    this.hasLoaded = false,
    this.loadErrorMessage,
    this.actionErrorMessage,
  });

  final List<Opportunity> opportunities;
  final String? selectedSkill;
  final bool isLoading;
  final bool hasLoaded;
  final String? loadErrorMessage;
  final String? actionErrorMessage;

  OpportunitiesState copyWith({
    List<Opportunity>? opportunities,
    String? selectedSkill,
    bool? isLoading,
    bool? hasLoaded,
    ValueGetter<String?>? loadErrorMessage,
    ValueGetter<String?>? actionErrorMessage,
  }) {
    return OpportunitiesState(
      opportunities: opportunities ?? this.opportunities,
      selectedSkill: selectedSkill ?? this.selectedSkill,
      isLoading: isLoading ?? this.isLoading,
      hasLoaded: hasLoaded ?? this.hasLoaded,
      loadErrorMessage:
          loadErrorMessage != null ? loadErrorMessage() : this.loadErrorMessage,
      actionErrorMessage: actionErrorMessage != null
          ? actionErrorMessage()
          : this.actionErrorMessage,
    );
  }

  @override
  List<Object?> get props => [
        opportunities,
        selectedSkill,
        isLoading,
        hasLoaded,
        loadErrorMessage,
        actionErrorMessage,
      ];
}
