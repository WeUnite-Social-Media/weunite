part of 'opportunities_cubit.dart';

class OpportunitiesState extends Equatable {
  const OpportunitiesState({
    this.opportunities = const [],
    this.pendingIds = const {},
    this.isLoading = false,
    this.hasLoaded = false,
    this.isSubmitting = false,
    this.loadErrorMessage,
    this.actionErrorMessage,
  });

  final List<Opportunity> opportunities;

  /// Opportunities with a save/apply request in flight (blocks double taps).
  final Set<int> pendingIds;
  final bool isLoading;
  final bool hasLoaded;

  /// A `createOpportunity` request is in flight (company accounts only).
  final bool isSubmitting;
  final String? loadErrorMessage;
  final String? actionErrorMessage;

  OpportunitiesState copyWith({
    List<Opportunity>? opportunities,
    Set<int>? pendingIds,
    bool? isLoading,
    bool? hasLoaded,
    bool? isSubmitting,
    ValueGetter<String?>? loadErrorMessage,
    ValueGetter<String?>? actionErrorMessage,
  }) {
    return OpportunitiesState(
      opportunities: opportunities ?? this.opportunities,
      pendingIds: pendingIds ?? this.pendingIds,
      isLoading: isLoading ?? this.isLoading,
      hasLoaded: hasLoaded ?? this.hasLoaded,
      isSubmitting: isSubmitting ?? this.isSubmitting,
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
        pendingIds,
        isLoading,
        hasLoaded,
        isSubmitting,
        loadErrorMessage,
        actionErrorMessage,
      ];
}
