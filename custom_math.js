// Standard Normal variate using Box-Muller transform.
export function gaussianRandom(mean=0, stdev=1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}

export function gaussianWithBounds(mean=0, stdev=1, min=-2, max=2)
{
    return Math.min(Math.max(min, gaussianRandom(mean,stdev)),max);
}

export function intGaussianWithBounds(mean=0, stdev=1, min=-2, max=2)
{
    return Math.round(Math.min(Math.max(min, gaussianRandom(mean,stdev)),max));
}

export function sphericalToCartesian(theta, phi)
{
    const theta_r = theta * Math.PI / 180;
    const phi_r = phi * Math.PI / 180;

    var pos_x = Math.sin(phi_r) * Math.cos(theta_r)
    var pos_y = Math.cos(phi_r);
    var pos_z = -Math.sin(phi_r) * Math.sin(theta_r);

    return {pos_x, pos_y, pos_z}
}