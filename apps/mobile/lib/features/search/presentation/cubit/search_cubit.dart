import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/app_exception.dart';
import '../../../feed/domain/entities/post.dart';
import '../../../feed/domain/repositories/feed_repository.dart';
import '../../../opportunities/domain/entities/opportunity.dart';
import '../../../opportunities/domain/repositories/opportunity_repository.dart';
import '../../../profile/domain/entities/profile.dart';
import '../../../profile/domain/repositories/profile_repository.dart';

part 'search_state.dart';

/// Same debounce the web search uses (`useSearchUsers`).
const kSearchDebounce = Duration(milliseconds: 300);

/// Searches users (`GET /user/search`), posts (`GET /posts/search`) and
/// opportunities. Opportunities are filtered on the client over the listing
/// endpoint, the same way `apps/web`'s `OpportunitySearch` does — the API has
/// no opportunity search endpoint.
class SearchCubit extends Cubit<SearchState> {
  SearchCubit({
    required ProfileRepository profileRepository,
    required FeedRepository feedRepository,
    required OpportunityRepository opportunityRepository,
  })  : _profileRepository = profileRepository,
        _feedRepository = feedRepository,
        _opportunityRepository = opportunityRepository,
        super(const SearchState());

  final ProfileRepository _profileRepository;
  final FeedRepository _feedRepository;
  final OpportunityRepository _opportunityRepository;

  Timer? _debounce;

  /// Called on every keystroke; the request only runs after [kSearchDebounce].
  void queryChanged(String query) {
    final trimmed = query.trim();
    _debounce?.cancel();

    if (trimmed.isEmpty) {
      emit(
        const SearchState(),
      );
      return;
    }

    emit(
      state.copyWith(
        query: trimmed,
        isLoading: true,
        errorMessage: () => null,
      ),
    );
    _debounce = Timer(kSearchDebounce, () => search(trimmed));
  }

  Future<void> search(String query) async {
    final trimmed = query.trim();
    if (trimmed.isEmpty) {
      return;
    }
    emit(
      state.copyWith(
        query: trimmed,
        isLoading: true,
        errorMessage: () => null,
      ),
    );
    try {
      final results = await Future.wait([
        _profileRepository.searchUsers(trimmed),
        _feedRepository.searchPosts(query: trimmed),
        _opportunityRepository.getOpportunities(),
      ]);
      if (isClosed || state.query != trimmed) {
        return;
      }
      emit(
        state.copyWith(
          isLoading: false,
          hasSearched: true,
          users: results[0] as List<Profile>,
          posts: results[1] as List<Post>,
          opportunities: _matchingOpportunities(
            results[2] as List<Opportunity>,
            trimmed,
          ),
        ),
      );
    } on AppException catch (error) {
      if (isClosed || state.query != trimmed) {
        return;
      }
      emit(
        state.copyWith(
          isLoading: false,
          hasSearched: true,
          errorMessage: () => error.message,
        ),
      );
    }
  }

  List<Opportunity> _matchingOpportunities(
    List<Opportunity> opportunities,
    String query,
  ) {
    final term = query.toLowerCase();
    return opportunities.where((opportunity) {
      final haystack = [
        opportunity.title,
        opportunity.description ?? '',
        opportunity.companyName,
        opportunity.location ?? '',
        ...opportunity.skills,
      ].join(' ').toLowerCase();
      return haystack.contains(term);
    }).toList();
  }

  @override
  Future<void> close() {
    _debounce?.cancel();
    return super.close();
  }
}
