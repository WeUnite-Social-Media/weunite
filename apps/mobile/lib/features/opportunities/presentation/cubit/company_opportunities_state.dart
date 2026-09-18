part of 'company_opportunities_cubit.dart';

class CompanyOpportunitiesState extends Equatable {
  const CompanyOpportunitiesState({
    this.opportunities = const [],
    this.pendingIds = const {},
    this.isLoading = false,
    this.hasLoaded = false,
    this.loadErrorMessage,
    this.actionErrorMessage,
  });

  final List<Opportunity> opportunities;

  /// Opportunities with a save/apply request in flight (blocks double taps).
  final Set<int> pendingIds;
  final bool isLoading;
  final bool hasLoaded;
  final String? loadErrorMessage;
  final String? actionErrorMessage;

  CompanyOpportunitiesState copyWith({
    List<Opportunity>? opportunities,
    Set<int>? pendingIds,
    bool? isLoading,
    bool? hasLoaded,
    ValueGetter<String?>? loadErrorMessage,
    ValueGetter<String?>? actionErrorMessage,
  }) {
    return CompanyOpportunitiesState(
      opportunities: opportunities ?? this.opportunities,
      pendingIds: pendingIds ?? this.pendingIds,
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
        pendingIds,
        isLoading,
        hasLoaded,
        loadErrorMessage,
        actionErrorMessage,
      ];
}
