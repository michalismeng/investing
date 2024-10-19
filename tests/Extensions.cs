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
        var expectedChanges = new List<decimal?> { 7, 7, 7, 7, 7 };
        expectedChanges.Should().Equal(result.Select(x => x.change).ToList());

        numbers = [1, 2, 4];
        numbers.Reverse();
        result = StockPriceExtensions.GetYearOverYearChange(numbers, e => e, 3);
        expectedChanges = [null, null, null];
        expectedChanges.Should().Equal(result.Select(x => x.change).ToList());

        numbers = [1, 2];
        numbers.Reverse();
        result = StockPriceExtensions.GetYearOverYearChange(numbers, e => e, 3);
        expectedChanges = [null, null];
        expectedChanges.Should().Equal(result.Select(x => x.change).ToList());

        numbers = [1, 2, 4, 8];
        numbers.Reverse();
        result = StockPriceExtensions.GetYearOverYearChange(numbers, e => e, 3);
        expectedChanges = [ 7, null, null ];
        expectedChanges.Should().Equal(result.Select(x => x.change).ToList());

        numbers = [-1, 1];
        numbers.Reverse();
        result = StockPriceExtensions.GetYearOverYearChange(numbers, e => e, 1);
        expectedChanges = [ 2 ];
        result.Select(x => x.change).Should().Equal(expectedChanges);
    }
}