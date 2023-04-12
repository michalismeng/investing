from sqlalchemy import MetaData, Table, Column, Integer, String, DECIMAL, TEXT, Date, Boolean, create_engine

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

watchlists = Table(
    'watchlists', meta,
    Column("name", String(256), primary_key=True),
    Column("adsh", String(20), primary_key=True),
)

engine = create_engine(connection_string, echo = True)
meta.create_all(engine)

metadata = MetaData()
metadata_connection_string = "sqlite:///metadata.db"

profiles = Table(
    'profiles', metadata,
    Column("name", String(256), primary_key=True),
    Column('date', TEXT),
    Column('description', TEXT),
    Column('locHQ', TEXT),
    Column('locOperations', TEXT),
    Column('prodsAndServices', TEXT),
    Column('revGeneration', TEXT),
    Column('sector', TEXT),
    Column('simple', Boolean),
    Column('lifecycle', TEXT),
    Column('website', String(256)),
    Column('irWebsite', String(256)),
    Column('founded', TEXT),
    Column('ipo', TEXT),
    Column('nature', TEXT),
    Column('exciting', Boolean),
    Column('dirty', Boolean),
    Column('hot', Boolean),
    Column('nicheDomination', TEXT),
    Column('competition', TEXT),
    Column('competitors', TEXT),
    Column('moat', TEXT),
    Column('cyclical', TEXT),
    Column('comment', TEXT),
)

metadata_engine = create_engine(metadata_connection_string, echo = True)
metadata.create_all(metadata_engine)
