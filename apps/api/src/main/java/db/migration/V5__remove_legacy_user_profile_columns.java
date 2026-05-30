package db.migration;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Locale;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

public class V5__remove_legacy_user_profile_columns extends BaseJavaMigration {

  private static final String[] LEGACY_PROFILE_COLUMNS = {
    "cpf", "height", "weight", "foot_domain", "position", "birth_date", "cnpj"
  };

  @Override
  public void migrate(Context context) throws Exception {
    Connection connection = context.getConnection();
    if (isPostgreSql(connection)) {
      execute(
          connection,
          "alter table tb_user "
              + "drop column cpf, "
              + "drop column height, "
              + "drop column weight, "
              + "drop column foot_domain, "
              + "drop column position, "
              + "drop column birth_date, "
              + "drop column cnpj");
      return;
    }

    for (String column : LEGACY_PROFILE_COLUMNS) {
      execute(connection, "alter table tb_user drop column " + column);
    }
  }

  private boolean isPostgreSql(Connection connection) throws SQLException {
    String productName = connection.getMetaData().getDatabaseProductName();
    return productName != null && productName.toLowerCase(Locale.ROOT).contains("postgresql");
  }

  private void execute(Connection connection, String sql) throws SQLException {
    try (Statement statement = connection.createStatement()) {
      statement.execute(sql);
    }
  }
}
