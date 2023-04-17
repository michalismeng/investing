from mongoengine import *

database = "financials_metadata"
connection_string = "mongodb://localhost:27017/%s" % database
connect(db=database, host=connection_string, tz_aware=True)


class Profile(EmbeddedDocument):
    date = DateTimeField()
    description = StringField()
    locHQ = StringField()
    locOperations = ListField(StringField())
    prodsAndServices = ListField(StringField())
    revGeneration = StringField()
    sector = StringField()
    simple = BooleanField()
    lifecycle = StringField()
    website = StringField()
    irWebsite = StringField()
    founded = DateTimeField()
    ipo = DateTimeField()
    nature = StringField()
    exciting = BooleanField()
    dirty = BooleanField()
    hot = BooleanField()
    nicheDomination = StringField()
    competition = StringField()
    competitors = ListField(StringField())
    moat = StringField()
    cyclical = StringField()
    comment = StringField()


class Company(Document):
    name = StringField(required=True)
    profiles = ListField(EmbeddedDocumentField(Profile))
    submissions = ListField(StringField(max_length=20))
    schemes = DictField(StringField())
