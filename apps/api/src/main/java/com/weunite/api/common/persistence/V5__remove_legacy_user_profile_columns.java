package com.weunite.api.common.persistence;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Locale;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

@Component
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
              + "drop column if exists cpf, "
              + "drop column if exists height, "
              + "drop column if exists weight, "
              + "drop column if exists foot_domain, "
              + "drop column if exists position, "
              + "drop column if exists birth_date, "
              + "drop column if exists cnpj");
      return;
    }

    for (String column : LEGACY_PROFILE_COLUMNS) {
      if (columnExists(connection, column)) {
        execute(connection, "alter table tb_user drop column " + column);
      }
    }
  }

  private boolean isPostgreSql(Connection connection) throws SQLException {
    String productName = connection.getMetaData().getDatabaseProductName();
    return productName != null && productName.toLowerCase(Locale.ROOT).contains("postgresql");
  }

  private boolean columnExists(Connection connection, String columnName) throws SQLException {
    try (ResultSet columns =
        connection.getMetaData().getColumns(null, null, "TB_USER", columnName.toUpperCase())) {
      if (columns.next()) {
        return true;
      }
    }

    try (ResultSet columns =
        connection.getMetaData().getColumns(null, null, "tb_user", columnName)) {
      return columns.next();
    }
  }

  private void execute(Connection connection, String sql) throws SQLException {
    try (Statement statement = connection.createStatement()) {
      statement.execute(sql);
    }
  }
}
