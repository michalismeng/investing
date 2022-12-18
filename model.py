from sqlalchemy import MetaData, Table, Column, Integer, String, DECIMAL, TEXT, create_engine

meta = MetaData()

db_name = "financial_data.db"
connection_string = "sqlite:///%s" % db_name

facts = Table(
    'facts', meta,
    Column("adsh", String(20), primary_key=True),
    Column("name", String(150)),
    Column("cik", String(10)),
    Column("tag", String(256), primary_key=True),
    Column("version", String(20)),
    Column("ddate", String(8)),
    Column("plabel", String(512)),
    Column("report", Integer),
    Column("line", Integer),
    Column("stmt", String(5), primary_key=True),
    Column("qtrs", Integer),
    Column("uom", String(20)),
    Column("value", DECIMAL),
)

schemes = Table(
    'schemes', meta,
    Column("name", String(150), primary_key=True),
    Column("stmt", String(5), primary_key=True),
    Column("value", TEXT),
)

engine = create_engine(connection_string, echo = True)
meta.create_all(engine)