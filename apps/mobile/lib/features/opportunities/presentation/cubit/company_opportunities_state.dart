part of 'company_opportunities_cubit.dart';

class CompanyOpportunitiesState extends Equatable {
  const CompanyOpportunitiesState({
    this.opportunities = const [],
    this.isLoading = false,
    this.hasLoaded = false,
    this.loadErrorMessage,
  });

  final List<Opportunity> opportunities;
  final bool isLoading;
  final bool hasLoaded;
  final String? loadErrorMessage;

  CompanyOpportunitiesState copyWith({
    List<Opportunity>? opportunities,
    bool? isLoading,
    bool? hasLoaded,
    ValueGetter<String?>? loadErrorMessage,
  }) {
    return CompanyOpportunitiesState(
      opportunities: opportunities ?? this.opportunities,
      isLoading: isLoading ?? this.isLoading,
      hasLoaded: hasLoaded ?? this.hasLoaded,
      loadErrorMessage:
          loadErrorMessage != null ? loadErrorMessage() : this.loadErrorMessage,
    );
  }

  @override
  List<Object?> get props => [
        opportunities,
        isLoading,
        hasLoaded,
        loadErrorMessage,
      ];
}
