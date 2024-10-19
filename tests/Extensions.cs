namespace tests;

using simulator.Extensions;

public class TestExtensions
{
    [Fact]
    public void TestGetYearOverYearChange()
    {
        var numbers = new List<decimal> { 1, 2, 4, 8, 16, 32, 64, 128 };
        numbers.Reverse();
        var result = StockPriceExtensions.GetYearOverYearChange(numbers, e => e, 3);
        var expectedChanges = new List<decimal?> { 7, 7, 7, 7, 7, null, null, null };
        expectedChanges.Should().Equal(result.Select(x => x.change).ToList());
        result.Select(x => x.entry).Should().Equal(numbers);

        numbers = [1, 2, 4];
        numbers.Reverse();
        result = StockPriceExtensions.GetYearOverYearChange(numbers, e => e, 3);
        expectedChanges = [null, null, null];
        result.Select(x => x.change).Should().Equal(expectedChanges);
        result.Select(x => x.entry).Should().Equal(numbers);

        numbers = [1, 2];
        numbers.Reverse();
        result = StockPriceExtensions.GetYearOverYearChange(numbers, e => e, 3);
        expectedChanges = [null, null];
        result.Select(x => x.change).Should().Equal(expectedChanges);
        result.Select(x => x.entry).Should().Equal(numbers);

        numbers = [1, 2, 4, 8];
        numbers.Reverse();
        result = StockPriceExtensions.GetYearOverYearChange(numbers, e => e, 3);
        expectedChanges = [ 7, null, null, null ];
        result.Select(x => x.change).Should().Equal(expectedChanges);
        result.Select(x => x.entry).Should().Equal(numbers);

        numbers = [-1, 1];
        numbers.Reverse();
        result = StockPriceExtensions.GetYearOverYearChange(numbers, e => e, 1);
        expectedChanges = [ 2, null ];
        result.Select(x => x.change).Should().Equal(expectedChanges);
        result.Select(x => x.entry).Should().Equal(numbers);

        numbers = [];
        numbers.Reverse();
        result = StockPriceExtensions.GetYearOverYearChange(numbers, e => e, 1);
        expectedChanges = [];
        result.Select(x => x.change).Should().Equal(expectedChanges);
        result.Select(x => x.entry).Should().Equal(numbers);
    }
    [Fact]
    public void TestSmooth()
    {
        var numbers = new List<decimal> { 1, 2, 4, 8, 16, 32, 64, 128 };
        var result = StockPriceExtensions.Smooth(numbers, e => e);
        var expectedChanges = new List<decimal?> { 1.5M, 3M, 6M, 12M, 24, 48, 96, null };
        result.Select(x => x.smooth).Should().Equal(expectedChanges);
        result.Select(x => x.entry).Should().Equal(numbers);

        numbers = [1, 2];
        result = StockPriceExtensions.Smooth(numbers, e => e);
        expectedChanges = [1.5M, null];
        result.Select(x => x.smooth).Should().Equal(expectedChanges);
        result.Select(x => x.entry).Should().Equal(numbers);

        numbers = [1];
        result = StockPriceExtensions.Smooth(numbers, e => e);
        expectedChanges = [null];
        result.Select(x => x.smooth).Should().Equal(expectedChanges);
        result.Select(x => x.entry).Should().Equal(numbers);

        numbers = [];
        result = StockPriceExtensions.Smooth(numbers, e => e);
        expectedChanges = [];
        result.Select(x => x.smooth).Should().Equal(expectedChanges);
        result.Select(x => x.entry).Should().Equal(numbers);
    }
}