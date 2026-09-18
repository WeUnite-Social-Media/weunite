import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/features/feed/domain/entities/comment.dart';
import 'package:weunite_mobile/features/feed/domain/entities/post.dart';
import 'package:weunite_mobile/features/feed/domain/repositories/feed_repository.dart';
import 'package:weunite_mobile/features/opportunities/domain/entities/opportunity.dart';
import 'package:weunite_mobile/features/opportunities/domain/repositories/opportunity_repository.dart';
import 'package:weunite_mobile/features/profile/domain/entities/profile.dart';
import 'package:weunite_mobile/features/profile/domain/repositories/profile_repository.dart';
import 'package:weunite_mobile/features/search/presentation/cubit/search_cubit.dart';

Post _post(int id, String text) {
  return Post(
    id: id,
    content: text,
    authorName: 'Caio Godas',
    authorUsername: 'caiogodas',
    createdAt: DateTime.utc(2026, 9, 17),
  );
}

Opportunity _opportunity(
  int id, {
  String title = 'Peneira sub-20',
  String company = 'Marca Teste',
  List<String> skills = const ['Futebol'],
}) {
  return Opportunity(
    id: id,
    title: title,
    description: 'Descricao',
    companyName: company,
    dateEnd: DateTime.utc(2026, 10, 17),
    skills: skills,
  );
}

class _FakeProfileRepository implements ProfileRepository {
  List<Profile> users = const [
    Profile(id: 2, name: 'Ana Teste QA', username: 'anateste', role: 'ATHLETE'),
  ];
  final queries = <String>[];
  bool throwsError = false;

  @override
  Future<List<Profile>> searchUsers(String query) async {
    queries.add(query);
    if (throwsError) {
      throw const AppException('Nao foi possivel buscar.');
    }
    return users;
  }

  @override
  Future<Profile> getProfileByUsername(String username) async =>
      throw UnimplementedError();

  @override
  Future<Profile> getProfile(int userId) async => throw UnimplementedError();

  @override
  Future<Profile> getMyProfile() async => throw UnimplementedError();

  @override
  Future<Profile> updateMyProfile({
    String? name,
    String? username,
    String? bio,
    bool? isPrivate,
    double? height,
    double? weight,
    String? footDomain,
    String? position,
    DateTime? birthDate,
    List<String>? skills,
    String? profileImagePath,
    String? bannerImagePath,
  }) async =>
      throw UnimplementedError();

  @override
  Future<Profile> deleteMyBanner() async => throw UnimplementedError();

  @override
  Future<List<String>> getAvailableSkills() async => const [];

  @override
  Future<bool> toggleFollow({required int followedId}) async => false;
}

class _FakeFeedRepository implements FeedRepository {
  List<Post> results = [_post(1, 'Peneira amanha')];
  final queries = <String>[];

  @override
  Future<List<Post>> searchPosts({required String query, int page = 0}) async {
    queries.add(query);
    return results;
  }

  @override
  Future<List<Post>> getTimeline({int page = 0}) async => const [];

  @override
  Future<List<Post>> getMyPosts({int page = 0}) async => const [];

  @override
  Future<List<Post>> getUserPosts({required int userId, int page = 0}) async =>
      const [];

  @override
  Future<void> createPost({required String content, String? imagePath}) async {}

  @override
  Future<void> toggleLike({required int postId}) async {}

  @override
  Future<List<Comment>> getComments({
    required int postId,
    int page = 0,
  }) async =>
      const [];

  @override
  Future<void> createComment({
    required int postId,
    required String content,
  }) async {}
}

class _FakeOpportunityRepository implements OpportunityRepository {
  List<Opportunity> opportunities = [
    _opportunity(1),
    _opportunity(2, title: 'Vaga de analista', company: 'Outra', skills: []),
  ];

  @override
  Future<List<Opportunity>> getOpportunities({int page = 0}) async =>
      opportunities;

  @override
  Future<List<Opportunity>> getCompanyOpportunities({
    required int companyId,
    int page = 0,
  }) async =>
      const [];

  @override
  Future<bool> toggleSaved({required int opportunityId}) async => true;

  @override
  Future<bool> toggleSubscription({required int opportunityId}) async => true;
}

SearchCubit _cubit({
  _FakeProfileRepository? profile,
  _FakeFeedRepository? feed,
  _FakeOpportunityRepository? opportunities,
}) {
  return SearchCubit(
    profileRepository: profile ?? _FakeProfileRepository(),
    feedRepository: feed ?? _FakeFeedRepository(),
    opportunityRepository: opportunities ?? _FakeOpportunityRepository(),
  );
}

void main() {
  group('SearchCubit', () {
    test('waits for the debounce before hitting the repositories', () async {
      final profile = _FakeProfileRepository();
      final cubit = _cubit(profile: profile);

      cubit
        ..queryChanged('a')
        ..queryChanged('an')
        ..queryChanged('ana');
      expect(profile.queries, isEmpty);
      expect(cubit.state.isLoading, isTrue);

      await Future<void>.delayed(kSearchDebounce * 2);

      expect(profile.queries, ['ana']);
      await cubit.close();
    });

    test('groups users, posts and matching opportunities', () async {
      final cubit = _cubit();

      await cubit.search('peneira');

      expect(cubit.state.users.single.username, 'anateste');
      expect(cubit.state.posts.single.content, 'Peneira amanha');
      expect(cubit.state.opportunities.map((o) => o.id), [1]);
      expect(cubit.state.hasSearched, isTrue);
      expect(cubit.state.isLoading, isFalse);
      await cubit.close();
    });

    test('filters opportunities by company and skill too', () async {
      final cubit = _cubit();

      await cubit.search('futebol');
      expect(cubit.state.opportunities.map((o) => o.id), [1]);

      await cubit.search('outra');
      expect(cubit.state.opportunities.map((o) => o.id), [2]);
      await cubit.close();
    });

    test('reports an empty result set', () async {
      final feed = _FakeFeedRepository()..results = [];
      final profile = _FakeProfileRepository()..users = const [];
      final cubit = _cubit(profile: profile, feed: feed);

      await cubit.search('zzzz');

      expect(cubit.state.isEmpty, isTrue);
      expect(cubit.state.hasSearched, isTrue);
      await cubit.close();
    });

    test('clearing the query resets the results', () async {
      final cubit = _cubit();
      await cubit.search('peneira');

      cubit.queryChanged('');

      expect(cubit.state, const SearchState());
      await cubit.close();
    });

    test('surfaces a repository failure', () async {
      final profile = _FakeProfileRepository()..throwsError = true;
      final cubit = _cubit(profile: profile);

      await cubit.search('ana');

      expect(cubit.state.errorMessage, 'Nao foi possivel buscar.');
      expect(cubit.state.isLoading, isFalse);
      await cubit.close();
    });
  });
}
