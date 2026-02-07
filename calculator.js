// ============================================
// INVESTMENT CALCULATOR WITH CROSSROCK RULES
// ============================================

// Rules:
// - 3 years: 9% p.a. (6% monthly + 3% yearly bonus)
// - 5 years: 10% p.a. (6% monthly + 4% yearly bonus)
// - Monthly rate: 6% / 12 = 0.5% per month
// - Yearly bonus: paid at end of each year
// - Investment range: 10,000 - 300,000 EUR (above = individual terms)

const investmentAmount = document.getElementById('investmentAmount');
const investmentPeriod = document.getElementById('investmentPeriod');
const amountSlider = document.getElementById('amountSlider');
const periodButtons = document.querySelectorAll('.period-btn');

// Result elements
const totalReturn = document.getElementById('totalReturn');
const monthlyReturn = document.getElementById('monthlyReturn');
const yearlyBonus = document.getElementById('yearlyBonus');
const yearlyTotal = document.getElementById('yearlyTotal');
const totalWithInvestment = document.getElementById('totalWithInvestment');
const totalPeriodLabel = document.getElementById('totalPeriodLabel');
const bonusPercentLabel = document.getElementById('bonusPercentLabel');
const totalRateLabel = document.getElementById('totalRateLabel');

// Investment period selection
periodButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active class from all buttons
        periodButtons.forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Update hidden input
        const years = parseInt(this.dataset.years);
        investmentPeriod.value = years;
        
        // Force immediate recalculation
        calculateReturns();
        
        // Debug log
        console.log('Period changed to:', years);
    });
});

// Sync input with slider
investmentAmount.addEventListener('input', (e) => {
    let value = parseFloat(e.target.value) || 0;
    
    // Allow typing any number, but update slider only for valid range
    if (value >= 10000 && value <= 300000) {
        amountSlider.value = value;
    }
    
    calculateReturns();
});

// Auto-correct on blur (when user leaves the field)
investmentAmount.addEventListener('blur', (e) => {
    let value = parseFloat(e.target.value) || 10000;
    
    // Auto-correct to minimum
    if (value < 10000) {
        value = 10000;
        investmentAmount.value = value;
    }
    
    // Clamp to maximum for slider
    if (value > 300000) {
        amountSlider.value = 300000;
    } else {
        amountSlider.value = value;
    }
    
    calculateReturns();
});

amountSlider.addEventListener('input', (e) => {
    investmentAmount.value = e.target.value;
    calculateReturns();
});

// Main calculation function
function calculateReturns() {
    const amount = parseFloat(investmentAmount.value) || 10000;
    const years = parseInt(investmentPeriod.value) || 3;
    
    // Determine rates based on period
    const monthlyRate = 0.06; // 6% p.a. = 0.5% per month
    const bonusRate = years === 3 ? 0.03 : 0.04; // 3% or 4% p.a.
    const totalRate = years === 3 ? 0.09 : 0.10; // 9% or 10% p.a.
    
    // Calculate returns
    const monthlyReturnValue = (amount * monthlyRate) / 12; // Per month
    const yearlyBonusValue = amount * bonusRate; // Per year
    const yearlyTotalValue = amount * totalRate; // Total per year
    const totalReturnValue = yearlyTotalValue * years; // Total for all years
    const totalWithInvestmentValue = amount + totalReturnValue;
    
    // Update display with animation
    animateValue(totalReturn, totalReturnValue);
    animateValue(monthlyReturn, monthlyReturnValue);
    animateValue(yearlyBonus, yearlyBonusValue);
    animateValue(yearlyTotal, yearlyTotalValue);
    animateValue(totalWithInvestment, totalWithInvestmentValue);
    
    // Update labels
    totalPeriodLabel.textContent = years === 3 ? '3 roky' : '5 rokov';
    bonusPercentLabel.textContent = years === 3 ? '3' : '4';
    totalRateLabel.textContent = years === 3 ? '9' : '10';
    
    // Update example calculation
    updateExample(amount, years);
}

// Animate number changes - SIMPLIFIED to fix bug
function animateValue(element, targetValue) {
    // Direct update without animation to ensure accuracy
    element.textContent = formatCurrency(targetValue);
}

// Format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('sk-SK', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value) + ' €';
}

// Update example calculation box
function updateExample(amount, years) {
    const monthlyRate = 0.06;
    const bonusRate = years === 3 ? 0.03 : 0.04;
    const totalRate = years === 3 ? 0.09 : 0.10;
    
    const monthlyReturnValue = (amount * monthlyRate) / 12;
    const yearlyBonusValue = amount * bonusRate;
    const yearlyTotalValue = amount * totalRate;
    const totalReturnValue = yearlyTotalValue * years;
    const totalWithInvestmentValue = amount + totalReturnValue;
    
    const exampleHTML = `
        <p><strong>Investícia ${formatCurrency(amount)}</strong> na <strong>${years} ${years === 3 ? 'roky' : 'rokov'}</strong> (${totalRate * 100}% p.a.)</p>
        <div class="example-breakdown">
            <div>Mesačný výnos: <strong>${formatCurrency(monthlyReturnValue)}</strong> (0,5% mesačne)</div>
            <div>Ročný bonus: <strong>${formatCurrency(yearlyBonusValue)}</strong> (${bonusRate * 100}% ročne)</div>
            <div class="example-divider"></div>
            <div>Celkom ročne: <strong>${formatCurrency(yearlyTotalValue)}</strong> (${totalRate * 100}% p.a.)</div>
            <div>Za ${years} ${years === 3 ? 'roky' : 'rokov'}: <strong>${formatCurrency(totalReturnValue)}</strong></div>
            <div class="example-total">Spolu dostanete: <strong>${formatCurrency(totalWithInvestmentValue)}</strong></div>
        </div>
    `;
    
    document.getElementById('exampleCalc').innerHTML = exampleHTML;
}

// Initial calculation
calculateReturns();

// Add warning for amounts over 300,000
investmentAmount.addEventListener('change', function() {
    const value = parseFloat(this.value);
    if (value > 300000) {
        alert('Pre investície nad 300 000 € ponúkame individuálne podmienky. Kontaktujte nás pre viac informácií.');
    }
});
