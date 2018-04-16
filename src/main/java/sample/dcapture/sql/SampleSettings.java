package sample.dcapture.sql;

import dcapture.sql.core.DatabaseContext;
import dcapture.sql.core.SqlDatabase;
import dcapture.sql.core.SqlLogger;
import dcapture.sql.core.SqlTable;
import dcapture.sql.postgres.PgDatabase;
import dcapture.sql.postgres.PostgresContext;
import org.apache.log4j.Logger;
import org.eclipse.jetty.servlet.ServletContextHandler;
import sample.dcapture.sql.service.SearchServlet;
import sample.dcapture.sql.service.UserServlet;

import javax.servlet.ServletContext;
import java.sql.SQLException;
import java.util.List;

abstract class SampleSettings {
    private static final Logger logger = Logger.getLogger(SampleSettings.class);
    static final String RESOURCE_BASE = "C:\\Users\\Ramesh\\IdeaProjects\\sample-dcapture-sql\\webapp";
    static final int SERVER_PORT = 7070;

    void setAttribute(ServletContext context) {
        try {
            DatabaseContext sqlContext = getSqlContext();
            context.setAttribute(DatabaseContext.class.getSimpleName(), sqlContext);
        } catch (Exception ex) {
            ex.printStackTrace();
            System.exit(1);
        }
    }

    private DatabaseContext getSqlContext() throws SQLException {
        DatabaseContext context = new PostgresContext();
        context.setDatabase(getDatabase());
        return context;
    }

    public SqlDatabase getDatabase() throws SQLException {
        SampleDatabase tutorial = new SampleDatabase();
        List<SqlTable> tableList = tutorial.loadTableList("sample-database.json");
        PgDatabase database = new PgDatabase();
        database.config("logger", getSqlLogger());
        database.config("schema", "dcapture");
        database.config("url", "jdbc:postgresql://localhost/tutorial");
        database.config("user", "postgres");
        database.config("password", "postgres");
        database.config("autoCommit", false);
        database.config("tableList", tableList);
        database.begin();
        return database;
    }

    void addServlet(ServletContextHandler context) {
        context.addServlet(UserServlet.class, "/user/*");
        context.addServlet(SearchServlet.class, "/search/*");
    }

    private SqlLogger getSqlLogger() {
        return new SqlLogger() {
            @Override
            public void onSqlLog(String description) {
                logger.info(description);
            }

            @Override
            public void onSqlError(Exception ex) {
                if (logger.isDebugEnabled()) {
                    ex.printStackTrace();
                }
                logger.error(ex.getMessage());
            }
        };
    }
}